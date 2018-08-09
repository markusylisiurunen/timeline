/**
 * @overview Work plugin.
 */

const ow = require('ow');
const prettyMs = require('pretty-ms');
const log = require('single-line-log').stdout;
const { getOptions } = require('../../util/options');
const { constructTable } = require('../../util/table');
const { hourlySalary } = require('./util');

/**
 * Add a new work entry to the timeline.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let add = async (args, { timeline }) => {
  const options = await getOptions(args, [
    { name: 'labels', flags: ['label', 'l'], question: { message: 'Labels:' } },
    { name: 'salary', flags: ['salary', 's'], question: { message: 'Salary:' } },
    { name: 'from', flags: ['from', 'f'], question: { message: 'Started at:' } },
    { name: 'to', flags: ['to', 't'], question: { message: 'Ended at:' } },
  ]);

  options.labels = options.labels.split(',').map(l => l.trim());
  options.salary = Number(options.salary);

  try {
    ow(options.labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(options.salary, ow.number.greaterThanOrEqual(0));

    options.from = Date.parse(options.from);
    options.to = Date.parse(options.to);
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  const hours = (options.to - options.from) / 3.6e6;
  const prettyHours = prettyMs(hours, { secDecimalDigits: 0 });

  const salaryPerHour = hourlySalary(options.salary);
  const earnings = hours * salaryPerHour;

  const description = `Worked for ${prettyHours} and earned ${earnings.toFixed(2)} €.`;

  timeline.add('work', options.labels, description, options.from, options.to, { earnings });

  console.log('Done.');
};

/**
 * Show live report of a current work event.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let live = async (args, { timeline }) => {
  const options = await getOptions(args, [
    { name: 'salary', flags: ['salary', 's'], question: { message: 'Salary:' } },
    { name: 'since', flags: ['since', 'S'], question: { message: 'Since:' } },
    { name: 'from', flags: ['from', 'f'], question: { message: 'Started at:' } },
  ]);

  options.salary = Number(options.salary);

  try {
    ow(options.salary, ow.number.greaterThanOrEqual(0));

    options.since = Date.parse(options.since);
    options.from = Date.parse(options.from);
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  const salaryPerHour = hourlySalary(options.salary);

  const events = timeline.getByType('work', { since: options.since });

  setInterval(() => {
    const duration = Date.now() - options.from;
    const earnings = (duration / 3.6e6) * salaryPerHour;

    let totalDuration = events.reduce((total, { from, to }) => total + (to - from), duration);
    let totalEarnings = events.reduce((total, { data }) => total + data.earnings, earnings);

    totalDuration = prettyMs(totalDuration, { secDecimalDigits: 0 });
    totalEarnings = `${totalEarnings.toFixed(2)} €`;

    const headers = ['Labels', 'Duration', 'Earnings'];
    const rows = [
      ...events,
      { labels: ['-'], from: options.from, to: Date.now(), data: { earnings } },
    ].map(event => [
      event.labels.join(', '),
      prettyMs(event.to - event.from, { secDecimalDigits: 0 }),
      `${event.data.earnings.toFixed(2)} €`,
    ]);

    const table = constructTable(headers, rows, { alignRight: [2] });
    const summary = `   Worked for ${totalDuration} and earned ${totalEarnings}.`;

    log(`${table}${summary}\n`);
  }, 100);
};

/**
 * Show a report of a given period.
 * @param {Object} args    Arguments passed to the progran.
 * @param {Object} context Context object.
 */
let report = async (args, { timeline }) => {
  const options = await getOptions(args, [
    { name: 'since', flags: ['since', 's'], question: { message: 'Since:' } },
    { name: 'until', flags: ['until', 'u'], question: { message: 'Until:' } },
  ]);

  try {
    options.since = Date.parse(options.since);
    options.until = Date.parse(options.until);
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  const events = timeline.getByType('work', { since: options.since, until: options.until });

  if (!events.length) {
    console.log('No events found.');
    return;
  }

  const head = ['From', 'To', 'Labels', 'Earnings'];
  const rows = events.map(event => [
    new Date(event.from).toLocaleString('ca-iso8601'),
    new Date(event.to).toLocaleString('ca-iso8601'),
    event.labels.join(', '),
    `${event.data.earnings.toFixed(2)} €`,
  ]);

  const table = constructTable(head, rows, { alignRight: [3] });

  const duration = events.reduce((total, { to, from }) => total + (to - from), 0);
  const earnings = events.reduce((total, event) => total + event.data.earnings, 0);

  const summary = `   Worked for ${prettyMs(duration)} and earned ${earnings.toFixed(2)} €.`;

  console.log(`${table}${summary}\n`);
};

module.exports = (args, context) => {
  const { commands } = context;

  add = add.bind(null, args, context);
  live = live.bind(null, args, context);
  report = report.bind(null, args, context);

  commands.register('work.add', add, 'Help: `work add`');
  commands.register('work.live', live, 'Help: `work live`');
  commands.register('work.report', report, 'Help: `work report`');
};
