/**
 * @overview Add
 */

const docs = require('../util/docs');

// Documentation
// prettier-ignore
const documentation = {
  add: docs.wrap([
    docs.block.text('Usage: timeline work add [options]'),
    docs.block.text('Add a new work event to the timeline.'),
    docs.block.list('Options', [
      ['-l, --label',       'required', 'Label(s) for the event'],
      ['-s, --salary',      'required', 'Salary (0-100 is hourly, otherwise monthly)'],
      ['-f, --from',        'required', 'Starting time for the event'],
      ['-t, --to',          'required', 'Ending time for the event'],
      ['-d, --description', 'optional', 'Description of the event'],
    ]),
    docs.block.list('Examples', [
      ['$', 'timeline work add --label book_1 --salary 2750 --from "2018-8-1 9:30 AM" --to "2018-8-1 1:15 PM"'],
      ['$', 'timeline work add -l writing -l book_1 -s 2500 -d "First chapter" -f "10:45 AM" -t "3:30 PM"'],
    ]),
  ]),
};

/**
 * Add a new entry to the timeline.
 */
const add = (args, config, timeline) => {
  console.log('Work: Add.');
};

module.exports = (args, config, timeline) => {
  timeline.registerCommand('work.add', add, documentation.add);
};
