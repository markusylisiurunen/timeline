/**
 * @overview Plugin to integrate with Google Sheets.
 */

const ow = require('ow');
const docs = require('./docs');
const { getSpreadsheet, listEvents, insertEvent } = require('./util');
const { getOptions } = require('../../util/options');

/**
 * Initialise the Google Sheets plugin.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let init = async (args, { configstore }) => {
  const credentials = configstore.get('google.credentials');

  if (!credentials) {
    console.log('Google API credentials not found.');
    return;
  }

  const options = await getOptions(args, [
    { name: 'id', flags: ['id'], question: { message: 'Spreadsheet id:' } },
    { name: 'sheet', flags: ['sheet'], question: { message: 'Sheet name:' } },
  ]);

  try {
    ow(options.id, ow.string.minLength(1));
    ow(options.sheet, ow.string.minLength(1));
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  let sheet = null;

  try {
    sheet = await getSpreadsheet(credentials, options.id);
  } catch (error) {
    console.log('Failed to initialise.');
    return;
  }

  configstore.set('sheets.id', options.id);
  configstore.set('sheets.sheet', options.sheet);
  configstore.set('sheets.locale', sheet.properties.locale);

  console.log('Done.');
};

/**
 * Reset the Google Sheets plugin.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let reset = async (args, { configstore }) => {
  configstore.delete('sheets');
  console.log('Done.');
};

/**
 * Load events from Google Sheet.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let loadEvents = async (args, { configstore, timeline }) => {
  const credentials = configstore.get('google.credentials');
  const { id, sheet } = configstore.get('sheets') || {};

  if (!(credentials && id && sheet)) {
    console.log('WARN (sheets): Events were not loaded.');
    return;
  }

  let events = null;

  try {
    events = await listEvents(credentials, id, sheet);
  } catch (error) {
    console.log('ERROR (sheets): Failed to load the events.');
    return;
  }

  timeline.init(events);
};

/**
 * Insert a new event to Google Sheets.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 * @param {Object} event   Event to be added.
 */
let onEventAdd = async (args, { configstore }, event) => {
  const credentials = configstore.get('google.credentials');
  const { id, sheet, locale } = configstore.get('sheets') || {};

  if (!(credentials && id && sheet)) {
    console.log('WARN (sheets): Event was not saved.');
    return;
  }

  try {
    await insertEvent(credentials, locale, id, sheet, event);
  } catch (error) {
    console.log('ERROR (sheets): Failed to save the event.');
  }
};

module.exports = async (args, context) => {
  const { lifecycle, commands, timeline } = context;

  init = init.bind(null, args, context);
  reset = reset.bind(null, args, context);
  loadEvents = loadEvents.bind(null, args, context);
  onEventAdd = onEventAdd.bind(null, args, context);

  lifecycle.on('preCommand', loadEvents);

  commands.register('sheets.init', init, docs.init);
  commands.register('sheets.reset', reset, docs.reset);

  timeline.on('event.add', onEventAdd);
};
