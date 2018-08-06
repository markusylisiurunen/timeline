/**
 * @overview Utility functions for Google Calendar plugin.
 */

const querystring = require('querystring');
const fetch = require('node-fetch');

/**
 * Request device and user codes from Google's OAuth server.
 * @param  {String}          id This app's client id for Google APIs.
 * @return {Promise<Object>}    Response from Google OAuth server.
 */
const requestDeviceAndUserCodes = async id => {
  const url = 'https://accounts.google.com/o/oauth2/device/code';
  const query = querystring.stringify({
    client_id: id,
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  const req = await fetch(`${url}?${query}`, { method: 'POST' });
  return req.json();
};

/**
 * Poll for the authorization by the user.
 * @param  {String}          id     This app's client id for Google APIs.
 * @param  {String}          secret This app's client secret for Google APIs.
 * @param  {String}          code   The device code acquired previously.
 * @return {Promise<Object>}        Response from Google OAuth server.
 */
const pollAuthorization = async (id, secret, code) => {
  const url = 'https://www.googleapis.com/oauth2/v4/token';
  const query = querystring.stringify({
    client_id: id,
    client_secret: secret,
    code: code,
    grant_type: 'http://oauth.net/grant_type/device/1.0',
  });

  const req = await fetch(`${url}?${query}`, { method: 'POST' });
  return req.json();
};

/**
 * Revoke previously authorized permissions.
 * @param  {String}  token Previously acquired token.
 * @return {Promise}       Resolved if successful.
 */
const revokeAuthorization = async token => {
  const url = 'https://accounts.google.com/o/oauth2/revoke';
  const query = querystring.stringify({ token });

  await fetch(`${url}?${query}`, { method: 'POST' });
};

module.exports = { requestDeviceAndUserCodes, pollAuthorization, revokeAuthorization };
