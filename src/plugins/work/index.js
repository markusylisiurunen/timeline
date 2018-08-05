/**
 * @overview Work plugin.
 */

const documentation = require('./documentation');

/** Add a new work entry to the timeline. */
const add = (args, config, timeline) => {};

/** Record a new live event and show its report. */
const live = (args, config, timeline) => {};

module.exports = async (args, config, timeline) => {
  Object.entries({ add, live }).forEach(([name, handler]) => {
    timeline.registerCommand(
      `work.${name}`,
      handler.bind(null, args, config, timeline),
      documentation[name]
    );
  });
};
