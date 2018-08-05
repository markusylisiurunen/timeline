/**
 * @overview Documentation for `work` plugin.
 */

const docs = require('../../util/docs');

// prettier-ignore
module.exports = {
  add: docs.wrap([
    docs.block.text('Usage: timeline work add [options]'),
    docs.block.text('Add a new work event to the timeline.'),
    docs.block.list('Options', [
      ['-l, --label',  'Label(s) for the event'],
      ['-s, --salary', 'Salary (0-100 is hourly, otherwise monthly)'],
      ['-f, --from',   'Starting time for the event'],
      ['-t, --to',     'Ending time for the event'],
    ]),
    docs.block.list('Examples', [
      ['$', 'timeline work add -l writing -l book_1 -s 2500 -f "01 Jan 2018 10:45" -t "01 Jan 2018 15:30"'],
    ]),
  ]),
  live: docs.wrap([
    docs.block.text('Usage: timeline work live [options]'),
    docs.block.text('Record a new live entry and show a report.'),
    docs.block.list('Options', [
      ['-s, --salary',  'Salary (0-100 is hourly, otherwise monthly)'],
      ['-i, --include', 'Include events within duration'],
      ['-f, --from',    'Starting time for the event'],
    ]),
    docs.block.list('Examples', [
      ['$', 'timeline work live -s 2650 -i "1h 30m" -f "01 Jan 2018 10:45"'],
    ]),
  ]),
};
