/**
 * @overview Configuration.
 */

const pkg = require('../package.json');

const { NODE_ENV } = process.env;

// Define the configurations for different environments
const configs = {};

configs['dev'] = {
  name: `${pkg.name}-dev`,
  calendar: {
    clientId: '194536656505-2oo1khnbsihdi3o2loss3cl2ivm2gr3c.apps.googleusercontent.com',
    clientSecret: 'CiFlb8GjY74tonEKHZGr-TTI',
  },
};

configs['prod'] = {
  name: pkg.name,
  calendar: {
    clientId: '194536656505-2oo1khnbsihdi3o2loss3cl2ivm2gr3c.apps.googleusercontent.com',
    clientSecret: 'CiFlb8GjY74tonEKHZGr-TTI',
  },
};

// Export the correct config
module.exports = NODE_ENV && configs[NODE_ENV] ? configs[NODE_ENV] : configs['prod'];
