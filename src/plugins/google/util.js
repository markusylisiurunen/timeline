/**
 * @overview Utility functions for the Google plugin.
 */

const querystring = require('querystring');
const fetch = require('node-fetch');

// Authorization functions

/**
 * Request device and user codes from Google's OAuth server.
 * @param  {String}          clientId Client id for this plugin.
 * @return {Promise<Object>}          Google OAuth server's response.
 */
const getCodes = async clientId => {
  const url = 'https://accounts.google.com/o/oauth2/device/code';
  const query = querystring.stringify({
    client_id: clientId,
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
    ].join(' '),
  });

  const res = await fetch(`${url}?${query}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};

/**
 * Poll for the credentials.
 * @param  {String}          clientId     Client id for this plugin.
 * @param  {String}          clientSecret Client secret for this plugin.
 * @param  {String}          deviceCode   The device code acquired previously.
 * @return {Promise<Object>}              Google OAuth server's response.
 */
const poll = async (clientId, clientSecret, deviceCode) => {
  const url = 'https://www.googleapis.com/oauth2/v4/token';
  const query = querystring.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: deviceCode,
    grant_type: 'http://oauth.net/grant_type/device/1.0',
  });

  const res = await fetch(`${url}?${query}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};

/**
 * Revoke granted permissions.
 * @param  {String}  accessToken Previously acquired access token.
 * @return {Promise}             Resolved once revoked.
 */
const revokeTokens = async accessToken => {
  const url = 'https://accounts.google.com/o/oauth2/revoke';
  const query = querystring.stringify({ token: accessToken });

  const res = await fetch(`${url}?${query}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) throw data;
};

/**
 * Refresh a previously acquired access token.
 * @param  {String}  clientId     Client id for this plugin.
 * @param  {String}  clientSecret Client secret for this plugin.
 * @param  {String}  refreshToken Refresh token to use.
 * @return {Promise}              Resolved once refreshed.
 */
const refreshAccessToken = async (clientId, clientSecret, refreshToken) => {
  const url = 'https://www.googleapis.com/oauth2/v4/token';
  const query = querystring.stringify({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await fetch(`${url}?${query}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};

module.exports = { getCodes, poll, revokeTokens, refreshAccessToken };
