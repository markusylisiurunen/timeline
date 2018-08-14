/**
 * @overview Utility functions for the Google plugin.
 */

const querystring = require('querystring');
const fetch = require('node-fetch');

// Utilities

/**
 * Make an Google API request and handle responses appropriately.
 * @param {Object} _         Parameters.
 * @return {Promise<Object>} Response object-
 */
const _fetch = async ({ verb = 'GET', url, query, headers, data } = {}) => {
  url = `${url}?${querystring.stringify(query || {})}`;

  const res = await fetch(url, {
    method: verb,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: data ? JSON.stringify(data) : null,
  });

  const responseData = await res.json();

  if (!res.ok) throw responseData;

  return responseData;
};

// Authorization functions

/**
 * Request device and user codes from Google's OAuth server.
 * @param  {String}          clientId Client id for this plugin.
 * @return {Promise<Object>}          Google OAuth server's response.
 */
const getCodes = async clientId =>
  _fetch({
    verb: 'POST',
    url: 'https://accounts.google.com/o/oauth2/device/code',
    query: {
      client_id: clientId,
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
      ].join(' '),
    },
  });

/**
 * Refresh a previously acquired access token.
 * @param  {String}          clientId     Client id for this plugin.
 * @param  {String}          clientSecret Client secret for this plugin.
 * @param  {String}          refreshToken Refresh token to use.
 * @return {Promise<Object>}              Request response.
 */
const refreshAccessToken = async (clientId, clientSecret, refreshToken) =>
  _fetch({
    verb: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    query: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    },
  });

/**
 * Wait for the user to grant the permissions.
 * @param  {String}          clientId     Client id for this plugin.
 * @param  {String}          clientSecret Client secret for this plugin.
 * @param  {Object}          codes        Device and user codes.
 * @return {Promise<Object>}              Request response.
 */
const waitForGrantedPermissions = async (clientId, clientSecret, codes) => {
  let interval = null;

  return new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      try {
        const granted = await _fetch({
          verb: 'POST',
          url: 'https://www.googleapis.com/oauth2/v4/token',
          query: {
            client_id: clientId,
            client_secret: clientSecret,
            code: codes.device_code,
            grant_type: 'http://oauth.net/grant_type/device/1.0',
          },
        });

        resolve({
          accessToken: granted.access_token,
          refreshToken: granted.refresh_token,
          tokenType: granted.token_type,
          expiresAt: Date.now() + granted.expires_in * 1000,
        });
      } catch (res) {
        if (res.error === 'authorization_pending') return;
        reject(res);
      }

      clearInterval(interval);
    }, codes.interval * 1000);
  });
};

/**
 * Revoke granted permissions.
 * @param  {String}          accessToken Previously acquired access token.
 * @return {Promise<Object>}             Request response.
 */
const revokeTokens = async accessToken =>
  _fetch({
    verb: 'POST',
    url: 'https://accounts.google.com/o/oauth2/revoke',
    query: { token: accessToken },
  });

// Google Sheets functions

/**
 * List user's sheets in a spreadsheet.
 * @param  {Object}          credentials Credentials for the user.
 * @return {Promise<Object>}             Response.
 */
const listSheets = async (credentials, spreadsheetId) => {
  const spreadsheet = await _fetch({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    query: { includeGridData: false },
    headers: { Authorization: `${credentials.tokenType} ${credentials.accessToken}` },
  });

  return spreadsheet.sheets;
};

// Google Calendar functions

/**
 * List user's calendars.
 * @param  {Object}          credentials Credentials for the user.
 * @return {Promise<Object>}             Response.
 */
const listCalendars = async credentials => {
  const calendarList = await _fetch({
    url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    query: { showHidden: true },
    headers: { Authorization: `${credentials.tokenType} ${credentials.accessToken}` },
  });

  return calendarList.items;
};

module.exports = {
  getCodes,
  refreshAccessToken,
  waitForGrantedPermissions,
  revokeTokens,
  listSheets,
  listCalendars,
};
