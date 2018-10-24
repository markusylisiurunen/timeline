/**
 * @overview Plugin for work events.
 */

const ow = require('ow');
const log = require('single-line-log').stdout;
const formatDuration = require('pretty-ms');
const utilDate = require('../../util/date');
const utilOptions = require('../../util/options');
const utilPlugin = require('./util');
const utilTable = require('../../util/table');
const utilUi = require('../../util/ui');

const docs = require('./docs');

/**
 * Add a new work entry to the timeline.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const add = async (args, { timeline }) => {
  // Create a set of existing labels for the user to select
  const labelsCollection = timeline
    .getByType('work')
    .reduce((acc, { labels }) => [...acc, ...labels], []);

  const labels = [...new Set(labelsCollection)].sort();

  // Prompt the user for information
  const options = await utilOptions.getOptions(
    args,
    {
      salary: ['salary', 's'],
      labels: ['label', 'l'],
      from: ['from', 'f'],
      to: ['to', 't'],
    },
    [
      {
        show: hash => !hash.salary,
        type: 'input',
        name: 'salary',
        message: 'Salary:',
      },
      {
        show: (_, argsHash) => !argsHash.labels && labels.length > 0,
        type: 'checkbox',
        name: 'labels',
        message: 'Pick from existing labels',
        choices: labels,
      },
      {
        show: (_, argsHash) => !argsHash.labels,
        transform: ans => (ans.length > 0 ? ans.split(',').map(label => label.trim()) : null),
        type: 'input',
        name: 'labels',
        message: 'Labels:',
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

  options.salary = options.salary && Number(options.salary);

  try {
    options.from = utilDate.parseDate(options.from).getTime();
    options.to = utilDate.parseDate(options.to).getTime();

    ow(options.labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(options.salary, ow.number.greaterThanOrEqual(0));
  } catch (error) {
    utilUi.say('Invalid options.');
    return;
  }

  const hours = (options.to - options.from) / 3.6e6;
  const prettyHours = formatDuration(options.to - options.from, {
    secDecimalDigits: 0,
    verbose: true,
  });

  const salaryPerHour = utilPlugin.hourlySalary(options.salary);
  const earnings = hours * salaryPerHour;

  const description = `Worked for ${prettyHours} and earned ${earnings.toFixed(2)} €.`;

  timeline.add('work', options.labels, description, options.from, options.to, { earnings });

  utilUi.say('Done.');
};

/**
 * Show live report of a current work event.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
const live = async (args, { timeline }) => {
  // Create the default since value
  const defaultSince = new Date();

  defaultSince.setHours(0);
  defaultSince.setMinutes(0);

  // Prompt the user for information
  const options = await utilOptions.getOptions(
    args,
    {
      salary: ['salary', 's'],
      since: ['since', 'S'],
      from: ['from', 'f'],
    },
    [
      {
        show: hash => !hash.salary,
        type: 'input',
        name: 'salary',
        message: 'Salary:',
      },
      {
        show: hash => !hash.since,
        type: 'input',
        name: 'since',
        message: 'Since:',
        default: utilDate.formatDateTime(defaultSince),
      },
      {
        show: hash => !hash.from,
        type: 'input',
        name: 'from',
        message: 'Starting time:',
      },
    ]
  );

  options.salary = Number(options.salary);

  // Validate options
  try {
    options.since = utilDate.parseDate(options.since).getTime();
    options.from = utilDate.parseDate(options.from).getTime();

    ow(options.salary, ow.number.greaterThanOrEqual(0));
  } catch (error) {
    utilUi.error('Invalid options.');
    return;
  }

  const salaryPerHour = utilPlugin.hourlySalary(options.salary);

  const events = timeline.getByType('work', { since: options.since });

  setInterval(() => {
    const duration = Date.now() - options.from;
    const earnings = (duration / 3.6e6) * salaryPerHour;

    let totalDuration = events.reduce((total, { from, to }) => total + (to - from), duration);
    let totalEarnings = events.reduce((total, { data }) => total + data.earnings, earnings);

    totalDuration = formatDuration(totalDuration, { secDecimalDigits: 0 });
    totalEarnings = `${totalEarnings.toFixed(2)} €`;

    const headers = ['Labels', 'Duration', 'Earnings'];
    const rows = [
      ...events,
      { labels: ['-'], from: options.from, to: Date.now(), data: { earnings } },
    ].map(event => [
      event.labels.join(', '),
      formatDuration(event.to - event.from, { secDecimalDigits: 0 }),
      `${event.data.earnings.toFixed(2)} €`,
    ]);

    const table = utilTable.constructTable(headers, rows, { alignRight: [2] });
    const summary = `   Worked for ${totalDuration} and earned ${totalEarnings}.`;

    log(`${table}${summary}\n`);
  }, 100);
};

/**
 * Show a report of a given period.
 * @param {Object} args    Arguments passed to the progran.
 * @param {Object} context Context object.
 */
const report = async (args, { timeline }) => {
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

  const events = timeline.getByType('work', { since: options.since, until: options.until });

  if (!events.length) {
    utilUi.say('No events found.');
    return;
  }

  const head = ['From', 'To', 'Labels', 'Earnings'];
  const rows = events.map(event => [
    new Date(event.from).toLocaleString('ca-iso8601'),
    new Date(event.to).toLocaleString('ca-iso8601'),
    event.labels.join(', '),
    `${event.data.earnings.toFixed(2)} €`,
  ]);

  const table = utilTable.constructTable(head, rows, { alignRight: [3] });

  const duration = events.reduce((total, { to, from }) => total + (to - from), 0);
  const earnings = events.reduce((total, event) => total + event.data.earnings, 0);

  const summary = `   Worked for ${formatDuration(duration)} and earned ${earnings.toFixed(2)} €.`;

  process.stdout.write(`${table}${summary}`);
};

module.exports = (args, context) => {
  const { commands } = context;

  commands.register('work.add', add.bind(null, args, context), docs.add);
  commands.register('work.live', live.bind(null, args, context), docs.live);
  commands.register('work.report', report.bind(null, args, context), docs.report);
};
