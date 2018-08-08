/**
 * @overview Utility functions for Google Calendar plugin.
 */

const fetch = require('node-fetch');

/**
 * Insert a new event to a calendar.
 * @param  {Object}          credentials Credentials for this plugin.
 * @param  {String}          calendarId  Calendar to insert to.
 * @param  {Object}          event       Event to insert.
 * @return {Promise<Object>}             The inserted event.
 */
const insertEvent = async (credentials, calendarId, event) => {
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
};

module.exports = { insertEvent };
