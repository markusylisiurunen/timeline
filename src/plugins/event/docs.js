/**
 * @overview Documentation for the event plugin.
 */

const docs = require('../../util/docs');

// prettier-ignore
module.exports = {
  add: docs.wrap([
    docs.block.text('Usage: timeline event add [options]'),
    docs.block.text('Add a new event to the timeline.'),
    docs.block.list('Options', [
      ['[--label, -l]',       'Label(s) for the event'],
      ['[--description, -d]', 'Description for the event'],
      ['[--from, -f]',        'Starting time for the event'],
      ['[--to, -t]',          'Ending time for the event'],
    ]),
  ]),

  reportByType: docs.wrap([
    docs.block.text('Usage: timeline event report type [options]'),
    docs.block.text('Show a report by type.'),
    docs.block.list('Options', [
      ['[--since, -s]', 'Include events since'],
      ['[--until, -u]', 'Include events until'],
    ]),
  ]),

  reportByLabel: docs.wrap([
    docs.block.text('Usage: timeline event report label [options]'),
    docs.block.text('Show a report by labels.'),
    docs.block.list('Options', [
      ['[--since, -s]', 'Include events since'],
      ['[--until, -u]', 'Include events until'],
    ]),
  ]),
};
