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
      ['-s, --salary', 'Salary (0-100 is hourly, otherwise monthly)'],
      ['-S, --since',  'Include events since time'],
      ['-f, --from',   'Starting time for the event'],
    ]),
    docs.block.list('Examples', [
      ['$', 'timeline work live -s 2650 -S "01 Jan 2018 8:00" -f "01 Jan 2018 10:45"'],
    ]),
  ]),
  report: docs.wrap([
    docs.block.text('Usage: timeline work report [options]'),
    docs.block.text('Print a report for a given period.'),
    docs.block.list('Options', [
      ['-s, --since',  'Since this time'],
      ['-u, --until',  'Until this time'],
    ]),
    docs.block.list('Examples', [
      ['$', 'timeline work report -s "01 Jan 2018 00:00" -u "01 Feb 2018 00:00"'],
    ]),
  ]),
};
