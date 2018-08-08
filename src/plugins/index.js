/**
 * @overview Group all plugins together.
 */

module.exports = (...args) => {
  // prettier-ignore
  [
    require('./calendar'),
    require('./google'),
    require('./sheets'),
    require('./work'),
  ].forEach(plugin => plugin(...args));
};
