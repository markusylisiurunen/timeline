/**
 * @overview Config for production.
 */

const pkg = require('../../package.json');

module.exports = {
  ...require('./base'),
  name: pkg.name,
};
