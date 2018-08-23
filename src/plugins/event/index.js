/**
 * @overview Plugin for general events.
 */

const ow = require('ow');
const combinatorics = require('js-combinatorics');
const formatDuration = require('pretty-ms');
const utilDate = require('../../util/date');
const utilOptions = require('../../util/options');
const utilTable = require('../../util/table');
const utilUi = require('../../util/ui');

const docs = require('./docs');

/**
 * Add an event to the timeline.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const add = async (args, { timeline }) => {
  // Create a set of existing labels for the user to select
  const labels = new Set(timeline.get().reduce((acc, { labels }) => [...acc, ...labels], []));

  // Prompt the user for information
  const options = await utilOptions.getOptions(
    args,
    {
      labels: ['label', 'l'],
      description: ['description', 'd'],
      from: ['from', 'f'],
      to: ['to', 't'],
    },
    [
      {
        show: (_, argsHash) => !argsHash.labels && labels.size > 0,
        type: 'checkbox',
        name: 'labels',
        message: 'Pick from existing labels',
        choices: [...labels],
      },
      {
        show: (_, argsHash) => !argsHash.labels,
        transform: ans => (ans.length > 0 ? ans.split(',').map(label => label.trim()) : null),
        type: 'input',
        name: 'labels',
        message: 'Labels:',
      },
      {
        show: hash => !hash.description,
        type: 'input',
        name: 'description',
        message: 'Description:',
      },
      {
        show: hash => !hash.from,
        type: 'input',
        name: 'from',
        message: 'Starting time:',
      },
      {
        show: hash => !hash.to,
        type: 'input',
        name: 'to',
        message: 'Ending time:',
      },
    ]
  );

  if (options.labels && !Array.isArray(options.labels)) {
    options.labels = [options.labels];
  }

  // Validate options
  try {
    options.from = utilDate.parseDate(options.from).getTime();
    options.to = utilDate.parseDate(options.to).getTime();

    ow(options.labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(options.description, ow.string.minLength(1));
  } catch (error) {
    console.log(error);
    utilUi.error('Invalid options.');
    return;
  }

  timeline.add('default', options.labels, options.description, options.from, options.to);
  utilUi.say('Event added to your timeline.');
};

/**
 * Show a report by type.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const reportByType = async (args, { timeline }) => {
  const options = await utilOptions.getOptions(
    args,
    {
      since: ['since', 's'],
      until: ['until', 'u'],
    },
    [
      {
        show: hash => !hash.since,
        type: 'input',
        name: 'since',
        message: 'Since:',
      },
      {
        show: hash => !hash.until,
        type: 'input',
        name: 'until',
        message: 'Until:',
        default: utilDate.formatDateTime(new Date()),
      },
    ]
  );

  // Validate options
  try {
    options.since = utilDate.parseDate(options.since).getTime();
    options.until = utilDate.parseDate(options.until).getTime();
  } catch (error) {
    utilUi.error('Invalid options.');
    return;
  }

  // Construct the report
  const events = timeline.get({ since: options.since, until: options.until });

  if (!events.length) {
    utilUi.say('No events found.');
    return;
  }

  const types = {};

  events.forEach(event => {
    const spentTime = event.to - event.from;
    types[event.type] = (types[event.type] || 0) + spentTime;
  });

  const head = ['Type', 'Spent time'];
  const rows = Object.keys(types)
    .sort()
    .map(type => [type, formatDuration(types[type])]);

  process.stdout.write(utilTable.constructTable(head, rows));
};

/**
 * Show a report by labels.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const reportByLabel = async (args, { timeline }) => {
  const options = await utilOptions.getOptions(
    args,
    {
      since: ['since', 's'],
      until: ['until', 'u'],
    },
    [
      {
        show: hash => !hash.since,
        type: 'input',
        name: 'since',
        message: 'Since:',
      },
      {
        show: hash => !hash.until,
        type: 'input',
        name: 'until',
        message: 'Until:',
        default: utilDate.formatDateTime(new Date()),
      },
    ]
  );

  // Validate options
  try {
    options.since = utilDate.parseDate(options.since).getTime();
    options.until = utilDate.parseDate(options.until).getTime();
  } catch (error) {
    utilUi.error('Invalid options.');
    return;
  }

  const events = timeline.get({ since: options.since, until: options.until });

  if (!events.length) {
    utilUi.say('No events found.');
    return;
  }

  const labelGroups = {};

  events.forEach(event => {
    combinatorics
      .power(event.labels)
      .filter(labelGroup => labelGroup.length > 0)
      .forEach(labelGroup => {
        const key = labelGroup.sort().join(', ');
        const spentTime = event.to - event.from;

        labelGroups[key] = (labelGroups[key] || 0) + spentTime;
      });
  });

  const head = ['Labels', 'Spent time'];
  const rows = Object.keys(labelGroups)
    .sort()
    .map(labelGroup => [labelGroup, formatDuration(labelGroups[labelGroup])]);

  process.stdout.write(utilTable.constructTable(head, rows));
};

module.exports = (args, context) => {
  const { commands } = context;

  commands.register('event.add', add.bind(null, args, context), docs.add);
  commands.register('event.report.type', reportByType.bind(null, args, context), docs.reportByType);
  commands.register(
    'event.report.label',
    reportByLabel.bind(null, args, context),
    docs.reportByLabel
  );
};
