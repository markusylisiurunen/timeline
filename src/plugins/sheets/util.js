/**
 * @overview Utility functions for Google Calendar plugin.
 */

const querystring = require('querystring');
const fetch = require('node-fetch');

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
  });

  const headers = {};

  headers['Authorization'] = `${credentials.tokenType} ${credentials.accessToken}`;
  headers['Accept'] = 'application/json';

  const res = await fetch(`${url}?${query}`, { headers });
  const data = await res.json();

  if (!res.ok) throw data;

  return data.values
    ? data.values.map(([id, type, labels, from, to, description, data]) => ({
        id,
        type,
        labels: labels.split(',').map(label => label.trim()),
        from: new Date(from),
        to: new Date(to),
        description,
        data: JSON.parse(data),
      }))
    : [];
};

/**
 * Insert a new event to a spreadsheet.
 * @param  {Object}          credentials   Credentials for Google API.
 * @param  {String}          spreadsheetId Spreadsheet to insert to.
 * @param  {String}          sheetName     Sheet to insert to.
 * @param  {Object}          event         Event to insert.
 * @return {Promise<Object>}               The inserted event.
 */
const insertEvent = async (credentials, spreadsheetId, sheetName, event) => {
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
        new Date(event.from).toISOString(),
        new Date(event.to).toISOString(),
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

module.exports = { listEvents, insertEvent };
