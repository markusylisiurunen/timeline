/**
 * @overview Utility functions for Google Calendar plugin.
 */

const querystring = require('querystring');
const fetch = require('node-fetch');

// Authoriation functions

const authorization = {
  /**
   * Request device and user codes from Google's OAuth server.
   * @param  {String}          clientId Client id for this plugin.
   * @return {Promise<Object>}          Google OAuth server's response.
   */
  async getCodes(clientId) {
    const url = 'https://accounts.google.com/o/oauth2/device/code';
    const query = querystring.stringify({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar',
    });

    const res = await fetch(`${url}?${query}`, { method: 'POST' });
    const data = await res.json();

    if (!res.ok) throw data;

    return data;
  },

  /**
   * Poll for the credentials.
   * @param  {String}          clientId     Client id for this plugin.
   * @param  {String}          clientSecret Client secret for this plugin.
   * @param  {String}          deviceCode   The device code acquired previously.
   * @return {Promise<Object>}              Google OAuth server's response.
   */
  async poll(clientId, clientSecret, deviceCode) {
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
  },

  /**
   * Revoke permissions.
   * @param  {String}  accessToken Previously acquired access token.
   * @return {Promise}             Resolved once revoked.
   */
  async revoke(accessToken) {
    const url = 'https://accounts.google.com/o/oauth2/revoke';
    const query = querystring.stringify({ token: accessToken });

    const res = await fetch(`${url}?${query}`, { method: 'POST' });

    if (!res.ok) throw new Error();
  },

  /**
   * Check if the plugin is authorized and possibly refresh the access token.
   * @param  {Configstore}      config App's configuration store.
   * @return {Promise<Boolean>}        True if was authorized, otherwise false.
   */
  async isAuthorized(config) {
    const credentials = config.get('calendar.credentials');

    if (!credentials) return false;

    // TODO: If credentials have expired, try to refresh.
    if (credentials.expiresAt < Date.now()) return false;

    return true;
  },
};

// Calendar functions

const calendars = {
  /**
   * Get user's calendars.
   * @param  {Object}         credentials Credentials for this plugin.
   * @return {Promise<Array>}             The user's calendars.
   */
  async list(credentials) {
    const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
    const headers = {};

    headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
    headers['Accept'] = 'application/json';

    const res = await fetch(url, { headers });
    const data = await res.json();

    if (!res.ok) throw data;

    return data.items;
  },

  /**
   * Create a new calendar.
   * @param  {Object}          credentials Credentials for this plugin.
   * @param  {Object}          calendar    Calendar to create.
   * @return {Promise<Object>}             The created calendar.
   */
  async create(credentials, calendar) {
    const url = 'https://www.googleapis.com/calendar/v3/calendars';
    const headers = {};

    headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';

    const body = JSON.stringify(calendar);

    const res = await fetch(url, { method: 'POST', headers, body });
    const data = await res.json();

    if (!res.ok) throw data;

    return data;
  },
};

// Events functions

const events = {
  /**
   * Insert a new event to a calendar.
   * @param  {Object}          credentials Credentials for this plugin.
   * @param  {String}          calendarId  Calendar to insert to.
   * @param  {Object}          event       Event to insert.
   * @return {Promise<Object>}             The inserted event.
   */
  async insert(credentials, calendarId, event) {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
    const headers = {};

    headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';

    const body = JSON.stringify(event);

    const res = await fetch(url, { method: 'POST', headers, body });
    const data = await res.json();

    if (!res.ok) throw data;

    return data;
  },
};

module.exports = { authorization, calendars, events };
