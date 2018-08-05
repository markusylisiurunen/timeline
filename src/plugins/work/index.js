/**
 * @overview Work plugin.
 */

const log = require('single-line-log').stdout;
const prettyMs = require('pretty-ms');
const documentation = require('./documentation');
const { parseFlags } = require('../../util/flags');
const { hourlySalary } = require('../../util/salary');
const { constructTable } = require('../../util/table');

/** Add a new work entry to the timeline. */
const add = (args, config, timeline) => {
  const flags = parseFlags(args, [['label', 'l'], ['salary', 's'], ['from', 'f'], ['to', 't']]);

  flags.label = Array.isArray(flags.label) ? flags.label : [flags.label];

  // TODO: Validation.

  const from = Date.parse(flags.from);
  const to = Date.parse(flags.to);
  const hours = (to - from) / 3.6e6;

  const salaryPerHour = hourlySalary(flags.salary);
  const earnings = hours * salaryPerHour;

  const description = `Spent ${hours.toFixed(2)} hours for ${earnings.toFixed(2)} €.`;

  timeline.add('work', flags.label, description, from, to, { earnings });

  console.log('Done.');
};

/** Record a new live event and show its report. */
const live = (args, config, timeline) => {
  const flags = parseFlags(args, [['salary', 's'], ['since', 'S'], ['from', 'f']]);

  // TODO: Validation.

  const from = Date.parse(flags.from);
  const since = Date.parse(flags.since);

  const salaryPerHour = hourlySalary(flags.salary);

  const events = timeline.getByType('work', { since });

  setInterval(() => {
    const duration = Date.now() - from;
    const earnings = ((Date.now() - from) / 3.6e6) * salaryPerHour;

    let totalDuration = events.reduce((total, { from, to }) => total + (to - from), duration);
    let totalEarnings = events.reduce((total, { data }) => total + data.earnings, earnings);

    totalDuration = prettyMs(totalDuration, { secDecimalDigits: 0 });
    totalEarnings = `${totalEarnings.toFixed(2)} €`;

    const headers = ['Labels', 'Duration', 'Earnings'];
    const rows = [...events, { labels: ['!live'], from, to: Date.now(), data: { earnings } }].map(
      event => [
        event.labels.join(', '),
        prettyMs(event.to - event.from, { secDecimalDigits: 0 }),
        `${event.data.earnings.toFixed(2)} €`,
      ]
    );

    const table = constructTable(headers, rows, { alignRight: [2] });
    const summary = `   You have worked for ${totalDuration} and earned ${totalEarnings}.`;

    log(`${table}${summary}\n`);
  }, 100);
};

/** Print a report for a given period. */
const report = (args, config, timeline) => {
  const flags = parseFlags(args, [['since', 's'], ['until', 'u']]);

  // TODO: Validate.

  const since = Date.parse(flags.since);
  const until = Date.parse(flags.until);

  const events = timeline.getByType('work', { since, until });

  if (!events.length) {
    console.log('No events found in the given period.');
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

  const duration = events.reduce((total, e) => total + (e.to - e.from), 0);
  const earnings = events.reduce((total, e) => total + e.data.earnings, 0);

  // prettier-ignore
  const summary = `   You have worked for ${prettyMs(duration)} and earned ${earnings.toFixed(2)} €.`;

  console.log(`${table}${summary}\n`);
};

module.exports = async (args, config, timeline) => {
  Object.entries({ add, live, report }).forEach(([name, handler]) => {
    timeline.registerCommand(
      `work.${name}`,
      handler.bind(null, args, config, timeline),
      documentation[name]
    );
  });
};
