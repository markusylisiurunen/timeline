/**
 * @overview Group all plugins together.
 */

module.exports = (...args) => {
  // prettier-ignore
  [
    require('./event'),
    require('./google'),
    require('./work'),
  ].forEach(plugin => plugin(...args));
};
