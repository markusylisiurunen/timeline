/**
 * @overview Utility functions for UI.
 */

const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Ask a question from the user.
 * @param  {Object}          question Question to ask.
 * @return {Promise<Object>}          User's answer.
 */
const ask = async question => inquirer.prompt({ prefix: chalk.yellow('?'), ...question });

/**
 * Print a message to the console.
 * @param {String} message Message to print.
 */
const say = message => console.log(`${chalk.cyan('>')} ${message}`);

/**
 * Print an error to the console.
 * @param {String} errorMessage Error message to print.
 */
const error = errorMessage => console.log(`${chalk.red('!')} ${errorMessage}`);

module.exports = { ask, say, error };
