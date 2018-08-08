/**
 * @overview A thin wrapper around the event emitter.
 */

const EventEmitter = require('events');

// FIXME: This is shit but whatever, it breaks everything :(
class Lifecycle extends EventEmitter {
  /**
   * Overridden `on` method for Promise support.
   * @param {String}   eventName The name of the event.
   * @param {Function} listener  Listener for the event.
   */
  on(eventName, listener) {
    this.super.on(eventName, (resolve, reject, ...args) =>
      listener(...args)
        .then(resolve)
        .catch(reject)
    );
  }

  /**
   * Overridden `emit` method for Promise support.
   * @param  {String} eventName The name of the event to emit.
   * @return {Promise}
   */
  async emit(eventName, ...args) {
    return new Promise((resolve, reject) => {
      this.super.emit(eventName, resolve, reject, ...args);
    });
  }
}

module.exports = Lifecycle;
