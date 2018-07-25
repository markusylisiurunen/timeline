/**
 * @overview Command handler functions.
 */

const ow = require('ow');

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

  process.stdout.write(
    getTable(
      ['Project', 'Salary'],
      salaries.map(({ project, salary }) => [project, `${salary.toFixed(2)} €`])
    )
  );
};

module.exports = { ...handlers };
