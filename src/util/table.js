/**
 * @overview Helpers for tables.
 */

const getTable = require('@markusylisiurunen/md-table');

/**
 * Construct a new table.
 * @param  {Array}  head      Head row titles.
 * @param  {Array}  rows      Rows for the table.
 * @param  {Object} [options] Options to pass to the table constructor.
 * @return {String}           The constructed table.
 */
const constructTable = (head, rows, options) =>
  getTable(head, rows, { x: 3, y: 1, colors: { head: '#eecc99', border: '#555' }, ...options });

module.exports = { constructTable };
