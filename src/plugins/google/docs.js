/**
 * @overview Documentation for the Google plugin.
 */

const docs = require('../../util/docs');

// prettier-ignore
module.exports = {
  init: docs.wrap([
    docs.block.text('Usage: timeline google init'),
    docs.block.text('Authorize the Google plugin with your Google account.'),
  ]),

  reset: docs.wrap([
    docs.block.text('Usage: timeline google reset'),
    docs.block.text('Revoke any granted permissions from the Google plugin.'),
  ]),
};
