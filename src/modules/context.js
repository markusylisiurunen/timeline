/**
 * @overview Context to be passed to every plugin.
 */

const EventEmitter = require('events');
const Commands = require('./commands');
const Timeline = require('./timeline');

/**
 * Create a new context object with some predefined fields.
 * @return {Object} A new context.
 */
const createContext = () => ({
  lifecycle: new EventEmitter(),
  commands: new Commands(),
  timeline: new Timeline(),
});

module.exports = { createContext };
