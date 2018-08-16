/**
 * @overview Options parsing utility functions.
 */

const ui = require('./ui');

/**
 * Combine options from flags and asked questions.
 * @param  {Object} flags     Parsed arguments.
 * @param  {Object} mappings  Mappings for the flags.
 * @param  {Array}  questions An array of questions.
 * @return {Object}           Combined options.
 */
const getOptions = async (flags, mappings, questions) => {
  const hash = {};

  // Map flags to the result hash
  Object.entries(mappings).forEach(([name, flagsToMap]) => {
    flagsToMap.forEach(flagToMap => {
      if (flags[flagToMap] !== undefined) {
        const hashIsArray = Array.isArray(hash[name]);
        const flagIsArray = Array.isArray(flags[flagToMap]);

        if (hashIsArray) {
          hash[name] = [...hash[name], ...(flagIsArray ? flags[flagToMap] : [flags[flagToMap]])];
        } else {
          hash[name] = flags[flagToMap];
        }
      }
    });
  });

  const hashFromFlags = { ...hash };

  // Ask the questions from the user
  for (let question of questions) {
    const { name, show, transform } = question;

    if (show && !(await show(hash, hashFromFlags))) continue;

    let answer = (await ui.ask(question))[name];

    if (transform) {
      answer = await transform(answer);
    }

    const hashIsArray = Array.isArray(hash[name]);
    const answerIsArray = Array.isArray(answer);

    if (hashIsArray) {
      hash[name] = [...hash[name], ...(answerIsArray ? answer : [answer])];
    } else {
      hash[name] = answer;
    }
  }

  return hash;
};

module.exports = { getOptions };
