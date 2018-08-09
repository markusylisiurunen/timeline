/**
 * @overview Configuration.
 */

const { NODE_ENV } = process.env;

const configs = {
  dev: require('./config/dev'),
  prod: require('./config/prod'),
};

module.exports = NODE_ENV && configs[NODE_ENV] ? configs[NODE_ENV] : configs['prod'];
