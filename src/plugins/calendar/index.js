/**
 * @overview Plugin to integrate with Google Calendar.
 */

const ow = require('ow');
const docs = require('./docs');
const { getOptions } = require('../../util/options');
const { listEvents, insertEvent } = require('./util');

/**
 * Initialise the Google Calendar plugin.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let init = async (args, { configstore }) => {
  const options = await getOptions(args, [
    { name: 'id', flags: ['id'], question: { message: 'Calendar id:' } },
  ]);

  try {
    ow(options.id, ow.string.minLength(1));
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  configstore.set('calendar.id', options.id);

  console.log('Done.');
};

/**
 * Sync all events to Google Calendar.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let sync = async (args, { configstore, timeline }) => {
  const credentials = configstore.get('google.credentials');
  const { id } = configstore.get('calendar') || {};

  if (!(credentials && id)) {
    console.log('Please grant permissions and set the calendar first.');
    return;
  }

  let events = null;

  try {
    events = await listEvents(credentials, id);
  } catch (error) {
    console.log('An error occured.');
    return;
  }

  const eventsInCalendar = new Set(events.map(({ id }) => id));

  try {
    await Promise.all(
      timeline.get().map(async event => {
        if (eventsInCalendar.has(event.id)) return;
        await insertEvent(credentials, id, event);
      })
    );
  } catch (error) {
    console.log(error, 'An error occured.');
    return;
  }

  console.log('Done.');
};

/**
 * Reset the Google Calendar plugin.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let reset = async (args, { configstore }) => {
  configstore.delete('calendar');
  console.log('Done.');
};

/**
 * Insert a new event to Google Calendar.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 * @param {Object} event   Event to be added.
 */
let onEventAdd = async (args, { configstore }, event) => {
  const credentials = configstore.get('google.credentials');
  const { id } = configstore.get('calendar') || {};

  if (!(credentials && id)) {
    console.log('WARN (calendar): Event was not added.');
    return;
  }

  try {
    await insertEvent(credentials, id, event);
  } catch (error) {
    console.log('ERROR (calendar): Failed to add the event.');
  }
};

module.exports = async (args, context) => {
  const { commands, timeline } = context;

  init = init.bind(null, args, context);
  reset = reset.bind(null, args, context);
  onEventAdd = onEventAdd.bind(null, args, context);

  commands.register('calendar.init', init, docs.init);
  commands.register('calendar.sync', sync, docs.sync);
  commands.register('calendar.reset', reset, docs.reset);

  timeline.on('event.add', onEventAdd);
};
