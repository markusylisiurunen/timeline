/**
 * @overview Google Calendar plugin.
 */

const documentation = require('./documentation');

/** Authenticate with the user's Google Calendar. */
const init = () => {
  console.log('Calendar: Init.');
};

/** Reset the tokens for the user's Google Calendar. */
const reset = () => {
  console.log('Calendar: Reset.');
};

/** Insert new events to the user's Google Calendar. */
const onAdd = () => {
  console.log('Calendar: Event added.');
};

/** Update an existing event in the user's Google Calendar. */
const onUpdate = () => {
  console.log('Calendar: Event updated.');
};

module.exports = async (args, config, timeline) => {
  timeline.registerCommand('calendar.init', init, documentation.init);
  timeline.registerCommand('calendar.reset', reset, documentation.reset);

  timeline.on('event.add', onAdd);
  timeline.on('event.update', onUpdate);
};
