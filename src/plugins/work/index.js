/**
 * @overview Work plugin.
 */

const parseDuration = require('parse-duration');
const prettyMs = require('pretty-ms');
const documentation = require('./documentation');
const { parseFlags } = require('../../util/flags');
const { hourlySalary } = require('../../util/salary');

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
  const flags = parseFlags(args, [['salary', 's'], ['include', 'i'], ['from', 'f']]);

  flags.include = parseDuration(flags.include);

  // TODO: Validation.

  const from = Date.parse(flags.from);
  const salaryPerHour = hourlySalary(flags.salary);

  const events = timeline.getByType('work', { since: Date.now() - flags.include });

  setInterval(() => {
    const duration = Date.now() - from;
    const earnings = ((Date.now() - from) / 3.6e6) * salaryPerHour;

    let totalDuration = events.reduce((total, { from, to }) => total + (to - from), duration);
    let totalEarnings = events.reduce((total, { data }) => total + data.earnings, earnings);

    totalDuration = prettyMs(totalDuration);
    totalEarnings = `${totalEarnings.toFixed(2)} €`;

    const summary = `You have worked ${totalDuration} and earned ${totalEarnings}.`;

    console.log(summary);
  }, 250);
};

module.exports = async (args, config, timeline) => {
  Object.entries({ add, live }).forEach(([name, handler]) => {
    timeline.registerCommand(
      `work.${name}`,
      handler.bind(null, args, config, timeline),
      documentation[name]
    );
  });
};
