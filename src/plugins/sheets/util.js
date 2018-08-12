/**
 * @overview Utility functions for Google Calendar plugin.
 */

const querystring = require('querystring');
const fetch = require('node-fetch');

/**
 * Convert a serial number date to a Date instance.
 * @param  {Number} serialNumberDate Date in the serial number format.
 * @return {Date}                    Date instance.
 */
const convertSerialNumberDate = serialNumberDate => {
  const daysSinceUnix = serialNumberDate - 25569;
  return new Date(Math.round(daysSinceUnix * 86400 * 1000));
};

/**
 * Get a spreadsheet.
 * @param  {Object}          credentials   Credentials for Google API.
 * @param  {String}          spreadsheetId Spreadsheet to get.
 * @return {Promise<Object>}               The spreadsheet.
 */
const getSpreadsheet = async (credentials, spreadsheetId) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const headers = {};

  headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
  headers['Accept'] = 'application/json';

  const res = await fetch(url, { headers });
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};

/**
 * List events from the spreadsheet.
 * @param  {Object}         credentials   Credentials for Google API.
 * @param  {String}         spreadsheetId Spreadsheet to insert to.
 * @param  {String}         sheetName     Sheet to insert to.
 * @return {Promise<Array>}               The loaded events.
 */
const listEvents = async (credentials, spreadsheetId, sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`;
  const query = querystring.stringify({
    majorDimension: 'ROWS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
  });

  const headers = {};

  headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
  headers['Accept'] = 'application/json';

  const res = await fetch(`${url}?${query}`, { headers });
  const data = await res.json();

  if (!res.ok) throw data;

  if (!data.values || !data.values.length) return [];

  return data.values.slice(1).map(row => {
    let [id, type, labels, from, to, description, data] = row;

    labels = labels.split(',').map(l => l.trim());

    from = convertSerialNumberDate(from);
    to = convertSerialNumberDate(to);

    data = JSON.parse(data);

    return { id, type, labels, from, to, description, data };
  });
};

/**
 * Insert a new event to a spreadsheet.
 * @param  {Object}          credentials   Credentials for Google API.
 * @param  {String}          locale        Locale to use for dates.
 * @param  {String}          spreadsheetId Spreadsheet to insert to.
 * @param  {String}          sheetName     Sheet to insert to.
 * @param  {Object}          event         Event to insert.
 * @return {Promise<Object>}               The inserted event.
 */
const insertEvent = async (credentials, locale, spreadsheetId, sheetName, event) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append`;
  const query = querystring.stringify({
    valueInputOption: 'USER_ENTERED',
  });

  const headers = {};

  headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';

  const body = JSON.stringify({
    range: sheetName,
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
  });

  const res = await fetch(`${url}?${query}`, { method: 'POST', headers, body });
  const data = await res.json();

  if (!res.ok) throw data;

  return data;
};

module.exports = { getSpreadsheet, listEvents, insertEvent };
