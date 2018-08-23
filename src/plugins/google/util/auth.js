/**
 * @overview Authorisation utility functions.
 */

const api = require('./api');

/**
 * Request device and user codes.
 * @param  {Object}          _          Parameters.
 * @param  {String}          _.clientId Client id for this plugin.
 * @param  {Array<String>}   [_.scopes] Scopes to ask the permission for.
 * @return {Promise<Object>}            Response data.
 */
const getDeviceAndUserCodes = async ({ clientId, scopes = [] } = {}) =>
  api.fetch({
    verb: 'POST',
    url: 'https://accounts.google.com/o/oauth2/device/code',
    query: { client_id: clientId, scope: scopes.join(' ') },
  });

/**
 * Wait for the user to grant the requested permissions.
 * @param  {Object}          _              Parameters.
 * @param  {String}          _.clientId     Client id for this plugin.
 * @param  {String}          _.clientSecret Client secret for this plugin.
 * @param  {String}          _.deviceCode   Device code.
 * @param  {Number}          _.pollInterval The frequency to poll at.
 * @return {Promise<Object>}                Response data.
 */
const waitForGrantedPermissions = async ({
  clientId,
  clientSecret,
  deviceCode,
  pollInterval,
} = {}) =>
  new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const tokens = await api.fetch({
          verb: 'POST',
          url: 'https://www.googleapis.com/oauth2/v4/token',
          query: {
            client_id: clientId,
            client_secret: clientSecret,
            code: deviceCode,
            grant_type: 'http://oauth.net/grant_type/device/1.0',
          },
        });

        resolve({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: tokens.token_type,
          expiresAt: Date.now() + tokens.expires_in * 1000,
        });
      } catch (tokens) {
        if (tokens.error && tokens.error === 'authorization_pending') return;
        reject(tokens);
      }

      clearInterval(interval);
    }, pollInterval);
  });

/**
 * Refresh an access token.
 * @param  {Object}          _              Parameters.
 * @param  {String}          _.clientId     Client id for this plugin.
 * @param  {String}          _.clientSecret Client secret for this plugin.
 * @param  {String}          _.refreshToken Refresh token.
 * @return {Promise<Object>}                Response data.
 */
const refreshAccessToken = async ({ clientId, clientSecret, refreshToken } = {}) => {
  const tokens = await api.fetch({
    verb: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    query: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    },
  });

  return {
    accessToken: tokens.access_token,
    tokenType: tokens.token_type,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
};

/**
 * Revoke granted access.
 * @param  {Object}          _             Parameters.
 * @param  {String}          _.accessToken Access token to revoke.
 * @return {Promise<Object>}               Response data.
 */
const revokeAccess = async ({ accessToken }) =>
  api.fetch({
    verb: 'POST',
    url: 'https://accounts.google.com/o/oauth2/revoke',
    query: { token: accessToken },
  });

module.exports = {
  getDeviceAndUserCodes,
  waitForGrantedPermissions,
  refreshAccessToken,
  revokeAccess,
};
