/**
 * @overview Parse options from flags or questions.
 */

const inquirer = require('inquirer');

/**
 * Get options for a command either from flags or via interactive questions.
 * @param  {Object} args    Parsed arguments.
 * @param  {Array}  options Array of options.
 * @return {Object}         Get options.
 */
const getOptions = async (args, options) => {
  const result = {};

  for (let option of options) {
    let value = null;

    if (Array.isArray(option.flags)) {
      for (let flag of option.flags) {
        value = args[flag] || null;
        if (value) break;
      }
    }

    if (!value && option.question) {
      value = (await inquirer.prompt({ name: option.name, ...option.question }))[option.name];
    }

    result[option.name] = value;
  }

  return result;
};

module.exports = { getOptions };
