/**
 * @overview Plugin to integrate with Google services.
 */

const chalk = require('chalk');
const config = require('../../config');
const ui = require('../../util/ui');
const util = require('./util');

const docs = require('./docs');

/**
 * Refresh the user's access token if it has expired.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let refreshToken = async (args, { configstore }) => {
  const credentials = configstore.get('google.credentials');

  if (!credentials || credentials.expiresAt > Date.now() - 30 * 1000) return;

  let tokens = null;

  try {
    tokens = await util.refreshAccessToken(
      config.google.clientId,
      config.google.clientSecret,
      credentials.refreshToken
    );
  } catch (error) {
    configstore.delete('google.credentials');
    return;
  }

  configstore.set('google.credentials', {
    ...credentials,
    accessToken: tokens.access_token,
    tokenType: tokens.token_type,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });
};

/**
 * Initialise the Google plugin.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let init = async (args, { configstore }) => {
  const googleConfig = configstore.get('google');

  // Revoke previous credentials if `init` has already been ran
  if (googleConfig) {
    try {
      await util.revokeTokens(
        config.google.clientId,
        config.google.clientSecret,
        googleConfig.credentials.refreshToken
      );
    } catch (e) {
      ui.error('Failed to revoke tokens.');
    }

    configstore.delete('google');
  }

  // Request user to grant permissions
  let codes = null;

  try {
    codes = await util.getCodes(config.google.clientId);
  } catch (error) {
    ui.error('Failed to acquire device and user codes.');
    return;
  }

  // prettier-ignore
  ui.say(chalk`Open {bold ${codes.verification_url}} and enter: {bold ${codes.user_code}}`);

  let credentials = null;

  try {
    credentials = await util.waitForGrantedPermissions(
      config.google.clientId,
      config.google.clientSecret,
      codes
    );
  } catch (error) {
    ui.error('Permissions not granted.');
    return;
  }

  // Ask the user to pick a spreadsheet, a sheet and a calendar
  const { spreadsheet } = await ui.ask({
    name: 'spreadsheet',
    message: 'Which spreadsheet to use?',
  });

  let sheets = null;

  try {
    sheets = await util.listSheets(credentials, spreadsheet);
  } catch (error) {
    ui.error('Failed to fetch sheets.');
    return;
  }

  const { sheet } = await ui.ask({
    type: 'list',
    name: 'sheet',
    message: 'Which sheet to use?',
    choices: sheets.map(({ properties }) => ({
      name: properties.title,
      value: properties.sheetId,
    })),
  });

  let calendars = null;

  try {
    calendars = await util.listCalendars(credentials);
  } catch (error) {
    ui.error('Failed to fetch calendars.');
    return;
  }

  const { calendar } = await ui.ask({
    type: 'list',
    name: 'calendar',
    message: 'Which calendar to use?',
    choices: calendars.map(calendar => ({ name: calendar.summary, value: calendar.id })),
  });

  // TODO: Validate the answers

  configstore.set('google', { credentials, spreadsheet, sheet, calendar });
  ui.say('Google services have been set up.');
};

/**
 * Reset the Google plugin.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let reset = async (args, { configstore }) => {
  const googleConfig = configstore.get('google');

  if (googleConfig) {
    configstore.delete('google');

    try {
      await util.revokeTokens(googleConfig.credentials.refreshToken);
    } catch (e) {
      ui.error('Failed to revoke tokens.');
    }
  }

  ui.say('Google plugin has been reset.');
};

module.exports = (args, context) => {
  const { lifecycle, commands } = context;

  refreshToken = refreshToken.bind(null, args, context);
  init = init.bind(null, args, context);
  reset = reset.bind(null, args, context);

  // Refresh the access token on init if necessary
  lifecycle.on('init', refreshToken);

  // Register commands for this plugin
  commands.register('google.init', init, docs.init);
  commands.register('google.reset', reset, docs.reset);
};
