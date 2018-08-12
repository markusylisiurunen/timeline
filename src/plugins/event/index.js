/**
 * @overview Event plugin.
 */

const ow = require('ow');
const prettyMs = require('pretty-ms');
const { power: powerSet } = require('js-combinatorics');
const docs = require('./docs');
const { getOptions } = require('../../util/options');
const { formatDate } = require('../../util/date');
const { constructTable } = require('../../util/table');

/**
 * Add a new event to the timeline.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let add = async (args, { timeline }) => {
  const options = await getOptions(args, [
    { name: 'labels', flags: ['label', 'l'], question: { message: 'Labels:' } },
    { name: 'description', flags: ['description', 'd'], question: { message: 'Description:' } },
    { name: 'from', flags: ['from', 'f'], question: { message: 'Started at:' } },
    { name: 'to', flags: ['to', 't'], question: { message: 'Ended at:' } },
  ]);

  options.labels = Array.isArray(options.labels)
    ? options.labels
    : options.labels.split(',').map(l => l.trim());

  options.from = Date.parse(options.from);
  options.to = Date.parse(options.to);

  try {
    ow(options.labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(options.description, ow.string.minLength(1));
    ow(options.from, ow.number.greaterThan(0));
    ow(options.to, ow.number.greaterThan(0));
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  timeline.add('default', options.labels, options.description, options.from, options.to);

  console.log('Done.');
};

/**
 * Show a report by labels.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let reportByLabel = async (args, { timeline }) => {
  // prettier-ignore
  const options = await getOptions(args, [
    { name: 'since', flags: ['since', 's'], question: { message: 'Since:' } },
    { name: 'until', flags: ['until', 'u'], question: { message: 'Until:', default: formatDate(new Date()) } },
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
    powerSet(event.labels)
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
    .map(labelGroup => [labelGroup, prettyMs(labelGroups[labelGroup])]);

  console.log(constructTable(head, rows));
};

module.exports = (args, context) => {
  const { commands } = context;

  add = add.bind(null, args, context);
  reportByLabel = reportByLabel.bind(null, args, context);

  commands.register('event.add', add, docs.add);
  commands.register('event.report.label', reportByLabel, docs.reportByLabel);
};
