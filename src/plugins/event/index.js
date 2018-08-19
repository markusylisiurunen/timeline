/**
 * @overview Plugin to manipulate general events.
 */

const ow = require('ow');
const combinatorics = require('js-combinatorics');
const formatDuration = require('pretty-ms');
const utilUi = require('../../util/ui');
const utilOptions = require('../../util/options');
const utilDate = require('../../util/date');
const utilTable = require('../../util/table');

const docs = require('./docs');

/**
 * Add an event to the timeline.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let add = async (args, { timeline }) => {
  const existingLabels = new Set(timeline.get().reduce((a, b) => [...a, ...b.labels], []));

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
        show: hash => !hash.labels && existingLabels.size > 0,
        type: 'checkbox',
        name: 'labels',
        message: 'Pick from existing labels',
        choices: [...existingLabels].sort(),
      },
      {
        show: (_, hashFromArgs) => !hashFromArgs.labels,
        transform: answer => answer.split(',').map(a => a.trim()),
        type: 'input',
        name: 'labels',
        message: 'Add new labels:',
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
let reportByType = async (args, { timeline }) => {
  // prettier-ignore
  const options = await utilOptions.getOptions(args, [
    { name: 'since', flags: ['since', 's'], question: { message: 'Since:' } },
    { name: 'until', flags: ['until', 'u'], question: { message: 'Until:', default: utilDate.formatDateTime(new Date()) } },
  ]);

  options.since = Date.parse(options.since);
  options.until = Date.parse(options.until);

  try {
    ow(options.since, ow.number.greaterThan(0));
    ow(options.until, ow.number.greaterThan(0));
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  const events = timeline.get({ since: options.since, until: options.until });

  if (!events.length) {
    console.log('No events found.');
    return;
  }

  const types = {};

  events.forEach(event => {
    const spentTime = event.to - event.from;
    types[event.type] = (types[event.type] || 0) + spentTime;
  });

  const head = ['Labels', 'Spent time'];
  const rows = Object.keys(types)
    .sort()
    .map(type => [type, formatDuration(types[type])]);

  console.log(utilTable.constructTable(head, rows));
};

/**
 * Show a report by labels.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let reportByLabel = async (args, { timeline }) => {
  // prettier-ignore
  const options = await utilOptions.getOptions(args, [
    { name: 'since', flags: ['since', 's'], question: { message: 'Since:' } },
    { name: 'until', flags: ['until', 'u'], question: { message: 'Until:', default: utilDate.formatDate(new Date()) } },
  ]);

  options.since = Date.parse(options.since);
  options.until = Date.parse(options.until);

  try {
    ow(options.since, ow.number.greaterThan(0));
    ow(options.until, ow.number.greaterThan(0));
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  const events = timeline.get({ since: options.since, until: options.until });

  if (!events.length) {
    console.log('No events found.');
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

  console.log(utilTable.constructTable(head, rows));
};

module.exports = (args, context) => {
  const { commands } = context;

  add = add.bind(null, args, context);
  reportByLabel = reportByLabel.bind(null, args, context);

  commands.register('event.add', add, docs.add);
  commands.register('event.report.type', reportByType, docs.reportByType);
  commands.register('event.report.label', reportByLabel, docs.reportByLabel);
};
