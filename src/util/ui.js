/**
 * @overview Utility functions for UI.
 */

const chalk = require('chalk');

/**
 * Print a message to the console.
 * @param {String} message Message to print.
 */
const say = message => process.stdout.write(`${chalk.cyan('>')} ${message}`);

module.exports = { say };
