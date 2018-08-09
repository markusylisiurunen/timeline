/**
 * @overview Documentation for the Google Sheets plugin.
 */

const docs = require('../../util/docs');

// prettier-ignore
module.exports = {
  init: docs.wrap([
    docs.block.text('Usage: timeline sheets init [options]'),
    docs.block.text('Initialise the Google Sheets plugin.'),
    docs.block.list('Options', [
      ['[--id]',  'Spreadsheet id'],
      ['[--sheet]',  'Sheet name'],
    ]),
  ]),

  reset: docs.wrap([
    docs.block.text('Usage: timeline sheets reset'),
    docs.block.text('Reset the Google Sheets plugin.'),
  ]),
};
