/**
 * @overview Commands class for registering commands and their documentation.
 */

class Commands {
  constructor() {
    this._commands = {};
  }

  _getCommand(path) {
    let i = 0;
    let command = this._commands;

    while (command && i < path.length) {
      command = command[path[i]] || null;
      i += 1;
    }

    return !command || !command.handler ? null : command;
  }

  isValid(command) {
    return Boolean(this._getCommand(command.split('.')));
  }

  getHelp(command) {
    const parts = command.split('.');

    while (parts.length) {
      const cmd = this._getCommand(parts);
      if (cmd) return cmd.help;
      parts.pop();
    }

    return 'Invalid command.';
  }

  register(command, handler, help) {}
}

module.exports = Commands;
