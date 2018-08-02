/**
 * @overview Group all plugins together.
 */

module.exports = (args, config, timeline) => {
  [require('./work'), require('./calendar')].forEach(plugin => plugin(args, config, timeline));
};
