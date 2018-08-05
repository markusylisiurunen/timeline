/**
 * @overview Helpers for command options.
 */

/**
 * Parse arguments to flags with fallback names.
 * @param  {Object} args Parsed arguments to the program.
 * @param  {Array}  keys An array of flags with their fallback names.
 * @return {Object}      An object of flags read from the arguments.
 */
const parseFlags = (args, keys) => {
  const result = {};

  keys.forEach(options => {
    const [name] = options;

    result[name] = null;

    for (let option of options) {
      if (args[option]) {
        result[name] = args[option];
        break;
      }
    }
  });

  return result;
};

module.exports = { parseFlags };
