/**
 * @overview Commands class for registering commands and their documentation.
 */

class Commands {
  /**
   * @constructor
   */
  constructor() {
    this._commands = {};
  }

  /**
   * Get a registered command or some of its parent.
   * @param  {Array}       path Path to the command.
   * @return {Object|null}      Found command.
   */
  _getLazy(path) {
    const copy = [...path];
    let command = null;

    while (copy.length) {
      if ((command = this._commands[copy.join('.')])) return command;
      copy.pop();
    }

    return null;
  }

  /**
   * Get a registered command.
   * @param  {Array}       path Path to the command.
   * @return {Object|null}      Found command.
   */
  _getStrict(path) {
    return this._commands[path.join('.')] || null;
  }

  /**
   * Check if a command is valid.
   * @param  {String}  command The command to check.
   * @return {Boolean}         True if was valid.
   */
  isValid(command) {
    return this._getStrict(command.split('.')) !== null;
  }

  /**
   * Register a new command.
   * @param {String}   command The name of the command to register.
   * @param {Function} handler Handler for the command.
   * @param {String}   help    Help information for the command.
   */
  register(command, handler, help) {
    this._commands[command] = { handler, help };
  }

  /**
   * Get help information for a command or one its closest parent.
   * @param  {String} command The command to get the help for.
   * @return {String}         Help information for the command.
   */
  help(command) {
    const lazy = this._getLazy(command.split('.'));
    return lazy ? lazy.help : 'Invalid command.';
  }

  /**
   * Execute a registered command.
   * @param {String} command The name of the command to execute.
   */
  execute(command, ...args) {
    const cmd = this._getStrict(command.split('.'));

    if (!cmd) throw new Error('Can not execute an unregistred command.');

    cmd.handler(...args);
  }
}

module.exports = Commands;
