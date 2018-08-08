/**
 * @overview Context to be passed to every plugin.
 */

const Configstore = require('configstore');
const config = require('../config');
const Lifecycle = require('./lifecycle');
const Commands = require('./commands');
const Timeline = require('./timeline');

/**
 * Create a new context object with some predefined fields.
 * @return {Object} A new context.
 */
const createContext = () => ({
  configstore: new Configstore(config.name, {}),
  lifecycle: new Lifecycle(),
  commands: new Commands(),
  timeline: new Timeline(),
});

module.exports = { createContext };
