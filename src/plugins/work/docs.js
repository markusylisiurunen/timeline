/**
 * @overview Documentation for the work plugin.
 */

const docs = require('../../util/docs');

// prettier-ignore
module.exports = {
  add: docs.wrap([
    docs.block.text('Usage: timeline work add [options]'),
    docs.block.text('Add a new work event to the timeline.'),
    docs.block.list('Options', [
      ['[--label, -l]',  'Label(s) for the event'],
      ['[--salary, -s]', 'Salary (0-100 is hourly, otherwise monthly)'],
      ['[--from, -f]',   'Starting time for the event'],
      ['[--to, -t]',     'Ending time for the event'],
    ]),
  ]),

  live: docs.wrap([
    docs.block.text('Usage: timeline work live [options]'),
    docs.block.text('Show a report for a live event.'),
    docs.block.list('Options', [
      ['[--salary, -s]', 'Salary (0-100 is hourly, otherwise monthly)'],
      ['[--since, -S]',  'Include events since this time'],
      ['[--from, -f]',   'Starting time for the event'],
    ]),
  ]),

  report: docs.wrap([
    docs.block.text('Usage: timeline work report [options]'),
    docs.block.text('Show a report for a given time period.'),
    docs.block.list('Options', [
      ['[--since, -s]', 'Since this time'],
      ['[--until, -u]', 'Until this time'],
    ]),
  ]),
};
