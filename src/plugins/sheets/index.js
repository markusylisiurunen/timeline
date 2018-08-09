/**
 * @overview Plugin to integrate with Google Sheets.
 */

const ow = require('ow');
const { insertEvent } = require('./util');
const { getOptions } = require('../../util/options');

/**
 * Set the active spreadsheet id and sheet name.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const set = async (args, { configstore }) => {
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

  configstore.set('sheets.id', options.id);
  configstore.set('sheets.sheet', options.sheet);

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
