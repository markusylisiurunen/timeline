/**
 * @overview Plugin to integrate with Google Calendar.
 */

const { insertEvent } = require('./util');

/**
 * Insert a new event to Google Calendar.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 * @param {Object} event   Event to be added.
 */
const onAdd = async (args, { configstore }, event) => {
  const credentials = configstore.get('google.credentials');

  // FIXME: Calendar id should be set from a config
  const calendarId = null;

  if (!credentials) return;

  await insertEvent(credentials, calendarId, {
    start: { dateTime: new Date(event.from).toISOString() },
    end: { dateTime: new Date(event.to).toISOString() },
    summary: event.description,
  });
};

module.exports = async (args, context) => {
  const { timeline } = context;

  timeline.on('event.add', onAdd.bind(null, args, context));
};
