/**
 * @overview Utility functions for Google Calendar plugin.
 */

const fetch = require('node-fetch');
const querystring = require('querystring');

/**
 * Create a summary from an event.
 * @param  {Object} event The event to create the summary from.
 * @return {String}       Summary for the event.
 */
const createSummary = event =>
  `${event.description} (type="${event.type}", labels="${event.labels.join(', ')}")`;

/**
 * Create a description from an event.
 * @param  {Object} event The event to create the description from.
 * @return {String}       Description for the event.
 */
const createDescription = event => `(id="${event.id}")`;

/**
 * List event ids in the Calendar.
 * @param  {Object}          credentials Credentials for this plugin.
 * @param  {String}          calendarId  Calendar to insert to.
 * @return {Promise<Object>}             The inserted event.
 */
const listEvents = async (credentials, calendarId) => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
  const query = querystring.stringify({
    maxResults: 2500,
  });

  const headers = {};

  headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
  headers['Accept'] = 'application/json';

  const res = await fetch(`${url}?${query}`, { headers });
  const data = await res.json();

  if (!res.ok) throw data;

  return data.items
    ? data.items.map(event =>
        event.description
          .match(/\((.*)\)/)[1]
          .split(',')
          .map(piece => piece.trim())
          .reduce(
            (result, part) => ({
              ...result,
              [part.split('=')[0]]: part.split('=')[1].split('"')[1],
            }),
            {}
          )
      )
    : [];
};

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

  const body = JSON.stringify({
    start: { dateTime: new Date(event.from).toISOString() },
    end: { dateTime: new Date(event.to).toISOString() },
    summary: createSummary(event),
    description: createDescription(event),
  });

  const res = await fetch(url, { method: 'POST', headers, body });
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};

module.exports = { createSummary, createDescription, listEvents, insertEvent };
