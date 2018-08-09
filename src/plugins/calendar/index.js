/**
 * @overview Plugin to integrate with Google Calendar.
 */

const { insertEvent } = require('./util');
const { parseFlags } = require('../../util/flags');

/**
 * Set the active calendar id.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const setId = (args, { configstore }) => {
  const flags = parseFlags(args, [['id']]);

  // TODO: Validate.

  configstore.set('calendar.id', flags.id);
  console.log('Done.');
};

/**
 * Insert a new event to Google Calendar.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 * @param {Object} event   Event to be added.
 */
const onAdd = async (args, { configstore }, event) => {
  const credentials = configstore.get('google.credentials');
  const calendarId = configstore.get('calendar.id');

  if (!credentials || !calendarId) return;

  await insertEvent(credentials, calendarId, {
    start: { dateTime: new Date(event.from).toISOString() },
    end: { dateTime: new Date(event.to).toISOString() },
    summary: event.description,
  });
};

module.exports = async (args, context) => {
  const { commands, timeline } = context;

  commands.register('calendar.set-id', setId.bind(null, args, context), 'Help: set-id.');

  timeline.on('event.add', onAdd.bind(null, args, context));
};
