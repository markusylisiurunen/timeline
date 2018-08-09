/**
 * @overview Configuration.
 */

const { NODE_ENV } = process.env;

const configs = {
  dev: require('./configs/dev'),
  prod: require('./configs/prod'),
};

module.exports = NODE_ENV && configs[NODE_ENV] ? configs[NODE_ENV] : configs['prod'];
