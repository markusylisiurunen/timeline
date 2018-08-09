/**
 * @overview Documentation for the Google plugin.
 */

const docs = require('../../util/docs');

// prettier-ignore
module.exports = {
  authenticate: docs.wrap([
    docs.block.text('Usage: timeline google authenticate'),
    docs.block.text('Authenticate the Google plugin with your Google account.'),
  ]),

  revoke: docs.wrap([
    docs.block.text('Usage: timeline google revoke'),
    docs.block.text('Revoke any granted permissions from the Google plugin.'),
  ]),
};
