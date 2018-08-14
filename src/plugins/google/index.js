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
 * Authorize the user with Google Calendar and Sheets.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let authorize = async (args, { configstore }) => {
  const googleConfig = configstore.get('google');

  // Revoke previous credentials if already init has been ran
  if (googleConfig) {
    await util.revokeTokens(googleConfig.credentials.accessToken);
  }

  // Request user to grant permissions
  const codes = await util.getCodes(config.google.clientId);

  // prettier-ignore
  ui.say(chalk`Open {bold ${codes.verification_url}} and enter {bold ${codes.user_code}}. Waiting...`);

  let credentials = null;

  try {
    credentials = await util.waitForGrantedPermissions(codes);
  } catch (error) {
    ui.error('Permissions not granted.');
    return;
  }

  // Ask the user to pick a spreadsheet and a calendar
  const sheets = await util.listSheets(credentials);
  const calendars = await util.listCalendars(credentials);

  const { sheet, calendar } = await ui.ask([
    {
      type: 'list',
      name: 'sheet',
      message: 'Which spreadsheet to use?',
      choices: sheets.map(sheet => ({ name: sheet.name, value: sheet.id })),
    },
    {
      type: 'list',
      name: 'calendar',
      message: 'Which calendar to use?',
      choices: calendars.map(calendar => ({ name: calendar.summary, value: calendar.id })),
    },
  ]);

  // TODO: Do the answers need to be validated?

  // const codes =

  // // prettier-ignore
  // return;

  // const checkPermissions = async () => {
  //   let res = null;

  //   try {
  //     res = await util.poll(config.google.clientId, config.google.clientSecret, codes.device_code);
  //   } catch (data) {
  //     if (data.error === 'authorization_pending') return res;

  //     if (data.error === 'access_denied') {
  //       throw new Error('You refused to grant permissions.');
  //     }

  //     throw new Error(data.error_description);
  //   }

  //   return res;
  // };

  // let interval = setInterval(async () => {
  //   let tokens = null;

  //   try {
  //     tokens = await checkPermissions();
  //   } catch (error) {
  //     console.log(error.message);
  //     clearInterval(interval);
  //   }

  //   if (!tokens || !tokens.access_token) return;

  //   clearInterval(interval);

  //   configstore.set('google.credentials', {
  //     accessToken: tokens.access_token,
  //     refreshToken: tokens.refresh_token,
  //     tokenType: tokens.token_type,
  //     expiresAt: Date.now() + tokens.expires_in * 1000,
  //   });

  //   console.log('Done.');
  // }, codes.interval * 1000);
};

/**
 * Revoke previously granted permissions.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let revoke = async (args, { configstore }) => {
  const credentials = configstore.get('google.credentials');

  configstore.delete('google.credentials');

  if (credentials) {
    await util.revokeTokens(credentials.accessToken);
  }

  console.log('Google plugin has been reset.');
};

module.exports = (args, context) => {
  const { lifecycle, commands } = context;

  refreshToken = refreshToken.bind(null, args, context);
  authorize = authorize.bind(null, args, context);
  revoke = revoke.bind(null, args, context);

  // Refresh the access token on init if necessary
  lifecycle.on('init', refreshToken);

  // Register commands for this plugin
  commands.register('google.authorize', authorize, docs.authorize);
  commands.register('google.revoke', revoke, docs.revoke);
};
