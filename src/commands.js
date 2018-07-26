/**
 * @overview Command handler functions.
 */

const ow = require('ow');
const log = require('single-line-log').stdout;
const {
  formatTimeDiff,
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
    from: args.from || args.f,
    salary: args.salary || args.s,
  };

  // Validate flags
  ow(flags.label, ow.string.minLength(1));
  ow(flags.from, ow.string.matches(/^[0-9]{1,2}:[0-9]{2}$/));
  ow(flags.salary, ow.number.greaterThanOrEqual(0));

  // TODO: Get saved entries from the past

  // Parse and normalise live entry values
  const from = parseTimeString(flags.from);
  const salaryPerHour = salaryNormalise(flags.salary);

  setInterval(() => {
    log(
      tableEntries([
        {
          from: new Date(from),
          to: new Date(),
          labels: [flags.label],
          money: salaryPerHour * ((Date.now() - from) / 3.6e6),
        },
      ])
    );
  }, 250);
};

module.exports = { ...commands };
