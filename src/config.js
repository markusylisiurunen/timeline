/**
 * @overview Configuration.
 */

const pkg = require('../package.json');

const { NODE_ENV } = process.env;

// Define the configurations for different environments
const configs = {};

configs['dev'] = {
  name: `${pkg.name}-dev`,
};

configs['prod'] = {
  name: pkg.name,
};

// Export the correct config
module.exports = NODE_ENV && configs[NODE_ENV] ? configs[NODE_ENV] : configs['prod'];
