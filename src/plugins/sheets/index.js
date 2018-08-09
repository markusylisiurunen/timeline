/**
 * @overview Plugin to integrate with Google Sheets.
 */

const { insertEvent } = require('./util');
const { parseFlags } = require('../../util/flags');

/**
 * Set the active spreadsheet id and sheet name.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const set = (args, { configstore }) => {
  const flags = parseFlags(args, [['id'], ['sheet']]);

  // TODO: Validate.

  configstore.set('sheets.id', flags.id);
  configstore.set('sheets.sheet', flags.sheet);

  console.log('Done.');
};

/**
 * Insert a new event to Google Sheets.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 * @param {Object} event   Event to be added.
 */
const onAdd = async (args, { configstore }, event) => {
  const credentials = configstore.get('google.credentials');
  const spreadsheetId = configstore.get('sheets.id');
  const sheetName = configstore.get('sheets.sheet');

  if (!credentials || !spreadsheetId || !sheetName) return;

  await insertEvent(credentials, spreadsheetId, sheetName, event);
};

module.exports = async (args, context) => {
  const { commands, timeline } = context;

  commands.register('sheets.set', set.bind(null, args, context), 'Help: set.');

  timeline.on('event.add', onAdd.bind(null, args, context));
};
