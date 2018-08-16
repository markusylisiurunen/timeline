/**
 * @overview Google Calendar utility functions.
 */

const api = require('./api');

/**
 * Get a color for an event.
 * @param  {Object}         _             Parameters.
 * @param  {Object}         _.credentials Credentials.
 * @param  {Object}         _.event       Event to get the color for.
 * @return {Promise<Array>}               A list of calendars.
 */
const colorId = async ({ credentials, event }) => {
  const colors = await api.fetch({
    url: 'https://www.googleapis.com/calendar/v3/colors',
    headers: { ...api.authorizationHeader({ credentials }) },
  });

  const eventColors = Object.keys(colors.event);

  // Create an event identifier based on the type and labels
  const identifier = `${event.type}${event.labels.join('')}`;

  // Map the event identifier to a color
  let hash = 0;

  for (let i = 0; i < identifier.length; i += 1) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }

  return eventColors.length ? eventColors[hash % eventColors.length] : undefined;
};

// Exported functions

/**
 * Get calendars.
 * @param  {Object}         _             Parameters.
 * @param  {Object}         _.credentials Credentials.
 * @return {Promise<Array>}               A list of calendars.
 */
const getCalendars = async ({ credentials } = {}) =>
  (await api.fetch({
    url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    query: { showHidden: true },
    headers: { ...api.authorizationHeader({ credentials }) },
  })).items;

/**
 * Get events in a calendar.
 * @param  {Object}         _             Parameters.
 * @param  {Object}         _.credentials Credentials.
 * @param  {String}         _.calendar    Calendar id.
 * @return {Promise<Array>}               A list of events.
 */
const getEvents = async ({ credentials, calendar } = {}) => {
  let events = await api.fetch({
    url: `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events`,
    query: { maxResults: 2500 },
    headers: { ...api.authorizationHeader({ credentials }) },
  });

  events = events.items && events.items.length ? events.items : [];

  return events.map(event => ({
    eventId: event.id,
    meta: event.description
      .match(/\((.*)\)/)[1]
      .split(',')
      .map(piece => piece.trim())
      .reduce(
        (result, part) => ({
          ...result,
          [part.split('=')[0]]: part.split('=')[1].split('"')[1],
        }),
        {}
      ),
  }));
};

/**
 * Add an event to a calendar.
 * @param  {Object}  _             Parameters.
 * @param  {Object}  _.credentials Credentials.
 * @param  {String}  _.calendar    Calendar id.
 * @param  {Object}  _.event       Event to add.
 * @return {Promise}               Resolves if added.
 */
const addEvent = async ({ credentials, calendar, event } = {}) =>
  api.fetch({
    verb: 'POST',
    url: `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events`,
    headers: { ...api.authorizationHeader({ credentials }) },
    data: {
      start: { dateTime: new Date(event.from).toISOString() },
      end: { dateTime: new Date(event.to).toISOString() },
      summary: `${event.description} (type="${event.type}", labels="${event.labels.join(', ')}")`,
      description: `(id="${event.id}")`,
      colorId: await colorId({ credentials, event }),
    },
  });

module.exports = { getCalendars, getEvents, addEvent };
