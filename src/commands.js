/**
 * @overview Command handler functions.
 */

const ow = require('ow');
const log = require('single-line-log').stdout;
const { getTable, getEntriesTable, parseTimeString, formatTimeDiff } = require('./util');

const handlers = {};

handlers['salary'] = async (args, tracker) => {
  const { 1: subcommand } = args._;
  const flags = {
    project: args.project || args.p,
    salary: args.salary || args.s,
  };

  // Validate subcommand
  ow(subcommand, ow.string.oneOf(['get', 'set']));

  if (subcommand === 'get') {
    if (flags.project !== undefined) {
      // Validate flags
      ow(flags.project, ow.string.minLength(1));

      const { salaryPerMonth } = tracker.getSalary(flags.project);

      console.log(`Salary for ${flags.project} is ${salaryPerMonth.toFixed(2)} €.`);

      return;
    }

    const salaries = tracker.getSalaries();
    const rows = salaries.map(s => [s.project, `${s.salaryPerMonth.toFixed(2)} €`]);

    process.stdout.write(getTable(['Project', 'Salary'], rows));
    return;
  }

  if (subcommand === 'set') {
    ow(flags.project, ow.string.minLength(1));
    ow(flags.salary, ow.number.greaterThanOrEqual(0));

    tracker.setSalary(flags.project, flags.salary);
    console.log(
      `Salary of ${flags.salary.toFixed(2)} € set for ${flags.project}.`
    );
  }
};

handlers['live'] = async (args, tracker) => {
  const flags = {
    project: args.project || args.p,
    from: args.from || args.f,
  };

  // Validate flags
  ow(flags.project, ow.string.minLength(1));
  ow(flags.from, ow.string.matches(/^[0-9]{1,2}:[0-9]{2}$/));

handlers['live'] = async (args, tracker) => {
  const flags = {
    label: args.label || args.l,
    from: args.from || args.f,
    salary: args.salary || args.s,
  };

  // Validate flags
  ow(flags.label, ow.string.minLength(1));
  ow(flags.from, ow.string.matches(/^[0-9]{1,2}:[0-9]{2}$/));
  ow(flags.salary, ow.number.greaterThanOrEqual(0));

  // TODO: Get saved entries to include to the total

  // Parse and normalise live entry values
  const from = parseTimeString(flags.from);
  const salaryPerHour = flags.salary <= 400 ? flags.salary : (flags.salary * 12) / 1719;

  /** Update the table in the output. */
  const update = () => {
    log(
      getEntriesTable([
        {
          from: new Date(from),
          to: new Date(),
          labels: [flags.label],
          money: salaryPerHour * ((Date.now() - from) / 3.6e6),
        },
      ])
    );
  };

  setInterval(update, 250);
  update();
};

module.exports = { ...handlers };
