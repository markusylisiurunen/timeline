/**
 * @overview Google Calendar plugin.
 *
 * Adds entries to Google Calendar for better visual presentation.
 */

module.exports = (args, config, timeline) => {
  // Push each added entry to Google Calendar
  timeline.on('event.add', event => console.log({ event }));
};
