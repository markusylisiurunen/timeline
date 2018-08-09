/**
 * @overview Config for development.
 */

const pkg = require('../../package.json');

module.exports = {
  ...require('./base'),
  name: `${pkg.name}-dev`,
};
