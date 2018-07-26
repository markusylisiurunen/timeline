/**
 * @overview Command handler functions.
 */

const ow = require('ow');
const log = require('single-line-log').stdout;
const {
  formatTimeDifference,
  parseTimeString,
  parseDuration,
  tableBuild,
  tableEntries,
  salaryNormalise,
} = require('./util');

const commands = {};

commands['entry'] = async (args, tracker) => {
  const subcommand = args._[1];
  const flags = {
    label: args.label || args.l,
    duration: args.duration || args.d,
    money: args.money || args.m,
  };

  if (!Array.isArray(flags.label)) {
    flags.label = [flags.label];
  }

  // Validate subcommand
  ow(subcommand, ow.string.oneOf(['add']));

  if (subcommand === 'add') {
    // Validate flags
    ow(flags.label, ow.array.nonEmpty);
    ow(flags.duration, ow.string.matches(/^[0-9]{1,2}:[0-9]{2}$/));

    if (flags.money !== undefined) ow(flags.money, ow.number.greaterThanOrEqual(0));

    tracker.addEntry({
      labels: flags.label,
      duration: parseDuration(flags.duration),
      money: flags.money || null,
    });

    console.log('New entry added.');
  }
};

commands['live'] = async (args, tracker) => {
  const flags = {
    label: args.label || args.l,
    salary: args.salary || args.s,
    since: args.since || args.S,
    from: args.from || args.f,
  };

  // Validate flags
  ow(flags.label, ow.string.minLength(1));
  ow(flags.from, ow.string.matches(/^[0-9]{1,2}:[0-9]{2}$/));
  ow(flags.salary, ow.number.greaterThanOrEqual(0));

  if (flags.since !== undefined) ow(flags.since, ow.string.matches(/^[0-9]{1,2}:[0-9]{2}$/));

  const entries = [];

  if (flags.since !== undefined) {
    const since = parseTimeString(flags.since);
    entries.push(...tracker.getEntriesSince(since));
  }

  // Parse and normalise live entry values
  const from = parseTimeString(flags.from);
  const salaryPerHour = salaryNormalise(flags.salary);

  setInterval(() => {
    const currentDuration = Date.now() - from;
    const currentMoney = salaryPerHour * ((Date.now() - from) / 3.6e6);

    const table = tableEntries([
      ...entries,
      { duration: currentDuration, labels: [flags.label], money: currentMoney },
    ]);

    let totalDuration = entries.reduce((t, e) => t + e.duration, currentDuration);
    let totalMoney = entries.reduce((t, e) => t + e.money, currentMoney);

    totalDuration = formatTimeDifference(totalDuration);
    totalMoney = `${totalMoney.toFixed(2)} €`;

    const summary = `You have worked ${totalDuration} and earned ${totalMoney}.`;

    log(['', table, summary.padStart(summary.length + 4), ''].join('\n'));
  }, 250);
};

module.exports = { ...commands };
