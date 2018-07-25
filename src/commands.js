/**
 * @overview Command handler functions.
 */

const ow = require('ow');
const log = require('single-line-log').stdout;
const { getTable, parseTimeString, formatTimeDiff } = require('./util');

const handlers = {};

/** Handle `salary` command. */
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

      console.log(
        `Salary for ${flags.project} is ${salaryPerMonth.toFixed(2)} €.`
      );

      return;
    }

    const salaries = tracker.getSalaries();
    const rows = salaries.map(s => [
      s.project,
      `${s.salaryPerMonth.toFixed(2)} €`,
    ]);

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

  // TODO: Get entries from the last 24 hours as a starting point
  const savedProjects = {};

  const from = parseTimeString(flags.from);
  const salary = tracker.getSalary(flags.project);

  /** Update the table in the output. */
  const update = () => {
    const elapsed = Date.now() - from;
    const projects = {
      ...savedProjects,
      [flags.project]: (savedProjects[flags.project] || 0) + elapsed,
    };

    log(
      getTable(
        ['Project', 'Spent time', 'Earned money'],
        Object.entries(projects).map(([project, time]) => [
          project,
          formatTimeDiff(time),
          salary
            ? `${((salary.salaryPerHour * time) / 3.6e6).toFixed(2)} €`
            : '-',
        ]),
        { alignRight: [2] }
      )
    );
  };

  setInterval(update, 1000);
  update();
};

module.exports = { ...handlers };
