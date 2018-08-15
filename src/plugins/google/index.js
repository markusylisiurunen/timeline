/**
 * @overview Plugin to integrate with Google services.
 */

const chalk = require('chalk');
const config = require('../../config');
const ui = require('../../util/ui');
const auth = require('./util/auth');
const googleSheets = require('./util/sheets');
const googleCalendar = require('./util/calendar');

const docs = require('./docs');

// Lifecycle hooks

/**
 * Refresh an expired access token.
 * @param {Object} context Context object.
 */
const refreshAccessToken = async ({ configstore }) => {
  const credentials = configstore.get('google.credentials');

  // Expires within 5 minutes
  const threshold = Date.now() + 5 * 60 * 1000;

  if (!credentials || credentials.expiresAt < threshold) return;

  // Use the refresh token to acquire a new access token
  try {
    const { clientId, clientSecret } = config.google;
    const { refreshToken } = credentials;

    const tokens = await auth.refreshAccessToken({ clientId, clientSecret, refreshToken });

    configstore.set('google.credentials', { ...credentials, ...tokens });
  } catch (error) {
    configstore.delete('google');
    ui.error('Failed to refresh Google API tokens.');
  }
};

/**
 * Load events from Google Sheets.
 * @param {Object} context Context object.
 */
const loadEvents = async ({ configstore, timeline }) => {
  const { credentials, spreadsheet, sheet } = configstore.get('google') || {};

  if (!(credentials && spreadsheet && sheet)) return;

  try {
    const events = await googleSheets.getEvents({ credentials, spreadsheet, sheet });
    timeline.init(events);
  } catch (error) {
    ui.error('Failed to load events from Google Sheets.');
  }
};

// Timeline hooks

/**
 * Add a new event to Google Sheets and Google Calendar.
 * @param {Object} context Context object.
 * @param {Object} event   Event to add.
 */
const onEventAdd = async ({ configstore }, event) => {
  const { credentials, spreadsheet, sheet, calendar } = configstore.get('google') || {};

  if (!(credentials && spreadsheet && sheet && calendar)) {
    ui.error('Failed to add event to Google services.');
    return;
  }

  try {
    await Promise.all([
      googleSheets.addEvent({ credentials, locale: 'fi-FI', spreadsheet, sheet, event }),
      googleCalendar.addEvent({ credentials, calendar, event }),
    ]);
  } catch (error) {
    ui.error('Failed to add event to Google Services.');
  }
};

// Commands

/**
 * Initialise the Google plugin.
 * @param {Object} context Context object.
 */
const init = async ({ configstore }) => {
  const googleConfig = configstore.get('google');

  // Revoke previous credentials
  if (googleConfig) {
    configstore.delete('google');

    try {
      const { accessToken } = googleConfig.credentials;
      await auth.revokeAccess({ accessToken });
    } catch (error) {}
  }

  const { clientId, clientSecret } = config.google;

  // Request user to grant permissions
  let codes = null;

  try {
    codes = await auth.getDeviceAndUserCodes({
      clientId,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
      ],
    });
  } catch (error) {
    ui.error('Failed to acquire device and user codes.');
    return;
  }

  ui.say(chalk`Open {bold ${codes.verification_url}} and enter: {bold ${codes.user_code}}`);

  let credentials = null;

  try {
    credentials = await auth.waitForGrantedPermissions({
      clientId,
      clientSecret,
      deviceCode: codes.device_code,
      pollInterval: codes.interval * 1000,
    });
  } catch (error) {
    console.log(error);
    ui.error('Permissions not granted.');
    return;
  }

  // Ask the user to pick a spreadsheet
  const { spreadsheet } = await ui.ask({
    name: 'spreadsheet',
    message: 'Which spreadsheet to use?',
  });

  // Ask the user to select a sheet
  let sheet = null;

  try {
    const sheets = await googleSheets.getSheets({ credentials, spreadsheet });

    ({ sheet } = await ui.ask({
      type: 'list',
      name: 'sheet',
      message: 'Which sheet to use?',
      choices: sheets.map(({ properties }) => ({
        name: properties.title,
        value: properties.sheetId,
      })),
    }));
  } catch (error) {
    ui.error('Failed to list sheets.');
    return;
  }

  // Ask the user to select a calendar
  let calendar = null;

  try {
    const calendars = await googleCalendar.getCalendars({ credentials });

    ({ calendar } = await ui.ask({
      type: 'list',
      name: 'calendar',
      message: 'Which calendar to use?',
      choices: calendars.map(calendar => ({ name: calendar.summary, value: calendar.id })),
    }));
  } catch (error) {
    ui.error('Failed to list calendars.');
    return;
  }

  // TODO: Validate the answers

  configstore.set('google', { credentials, spreadsheet, sheet, calendar });
  ui.say('Google services have been set up.');
};

/**
 * Reset the Google plugin.
 * @param {Object} context Context object.
 */
const reset = async ({ configstore }) => {
  const googleConfig = configstore.get('google');

  if (googleConfig) {
    configstore.delete('google');

    try {
      const { accessToken } = googleConfig.credentials;
      await auth.revokeAccess({ accessToken });
    } catch (error) {
      ui.error('Failed to revoke permissions.');
      return;
    }
  }

  ui.say('Google plugin has been reset.');
};

module.exports = (args, context) => {
  const { lifecycle, commands, timeline } = context;

  lifecycle.on('init', refreshAccessToken.bind(null, context));
  lifecycle.on('preCommand', loadEvents.bind(null, context));

  timeline.on('event.add', onEventAdd.bind(null, context));

  commands.register('google.init', init.bind(null, context), docs.init);
  commands.register('google.reset', reset.bind(null, context), docs.reset);
};
