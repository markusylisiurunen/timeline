/**
 * @overview Google Calendar plugin documentation.
 */

const docs = require('../../util/docs');

module.exports = {
  init: docs.wrap([
    docs.block.text('Usage: timeline calendar init'),
    docs.block.text('Authenticate the calendar plugin with Google Calendar.'),
  ]),
  reset: docs.wrap([
    docs.block.text('Usage: timeline calendar reset'),
    docs.block.text('Reset the calendar plugin.'),
  ]),
};
