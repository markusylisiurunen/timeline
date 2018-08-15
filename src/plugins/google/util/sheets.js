/**
 * @overview Google Sheets utility functions.
 */

const api = require('./api');

/**
 * Convert a serial number date to a Date instance.
 * @param  {Number} serialNumberDate Date in the serial number format.
 * @return {Date}                    Converted date.
 */
const convertSerialNumberDate = serialNumberDate => {
  const daysSinceUnix = serialNumberDate - 25569;
  return new Date(Math.round(daysSinceUnix * 86400 * 1000));
};

// Exported functions

/**
 * Get a spreadsheet.
 * @param  {Object}          _             Parameters.
 * @param  {Object}          _.credentials Credentials.
 * @param  {String}          _.spreadsheet Spreadsheet's id.
 * @return {Promise<Object>}               The spreadsheet.
 */
const getSpreadsheet = async ({ credentials, spreadsheet }) =>
  api.fetch({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}`,
    headers: { ...api.authorizationHeader({ credentials }) },
  });

/**
 * Get spreadsheet's sheets.
 * @param  {Object}          _             Parameters.
 * @param  {Object}          _.credentials Credentials.
 * @param  {String}          _.spreadsheet Spreadsheet's id.
 * @return {Promise<Array>}                A list of sheets.
 */
const getSheets = async ({ credentials, spreadsheet } = {}) =>
  (await api.fetch({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}`,
    query: { includeGridData: false },
    headers: { ...api.authorizationHeader({ credentials }) },
  })).sheets;

/**
 * Get events from a spreadsheet.
 * @param  {Object}         _             Parameters.
 * @param  {Object}         _.credentials Credentials.
 * @param  {String}         _.spreadsheet Spreadsheet id.
 * @param  {String}         _.sheet       Sheet to get from.
 * @return {Promise<Array>}               Events.
 */
const getEvents = async ({ credentials, spreadsheet, sheet } = {}) => {
  let events = await api.fetch({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/${sheet}`,
    query: {
      majorDimension: 'ROWS',
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'SERIAL_NUMBER',
    },
    headers: { ...api.authorizationHeader({ credentials }) },
  });

  if (!events.values || !events.values.length) return [];

  events = events.values;

  // FIXME: What if the first row is not a header row?
  return events.slice(1).map(row => {
    let [id, type, labels, from, to, description, data] = row;

    labels = labels.split(',').map(l => l.trim());

    from = convertSerialNumberDate(from);
    to = convertSerialNumberDate(to);

    data = JSON.parse(data);

    return { id, type, labels, from, to, description, data };
  });
};

/**
 * Add an event to a spreadsheet.
 * @param  {Object}  _             Parameters.
 * @param  {Object}  _.credentials Credentials.
 * @param  {String}  _.locale      Locale for dates.
 * @param  {String}  _.spreadsheet Spreadsheet id.
 * @param  {String}  _.sheet       Sheet to add to.
 * @param  {Object}  _.event       Event to insert.
 * @return {Promise}               Resolves if added.
 */
const addEvent = async ({ credentials, locale, spreadsheet, sheet, event } = {}) =>
  api.fetch({
    verb: 'POST',
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}/values/${sheet}:append`,
    query: { valueInputOption: 'USER_ENTERED' },
    headers: { ...api.authorizationHeader({ credentials }) },
    body: {
      range: sheet,
      majorDimension: 'ROWS',
      values: [
        [
          event.id,
          event.type,
          event.labels.join(', '),
          new Date(event.from).toLocaleString(locale),
          new Date(event.to).toLocaleString(locale),
          event.description,
          JSON.stringify(event.data),
        ],
      ],
    },
  });

module.exports = { getSpreadsheet, getSheets, getEvents, addEvent };
