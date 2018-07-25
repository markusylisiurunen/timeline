/**
 * @overview Command handler functions.
 */

const { getTable } = require('./util');

const handlers = {};

/** Handle `salary` command. */
handlers['salary'] = async (args, tracker) => {
  const flags = {
    project: args.project || args.p,
    salary: args.salary || args.s,
  };

  // Set a new salary for a project
  if (flags.salary !== undefined) {
    if (typeof flags.project !== 'string' || flags.project.length === 0) {
      throw new Error('Project must be set and it must be a string.');
    }

    if (typeof flags.salary !== 'number' || flags.salary < 0) {
      throw new Error('Salary must be a number and it must be more than 0.');
    }

    tracker.setSalary(args.project, args.salary);
    return;
  }

  // Get salary for a single project
  const salaries = tracker.getSalary(args.project);

  process.stdout.write(
    getTable(
      ['Project', 'Salary'],
      salaries.map(({ project, salary }) => [project, `${salary.toFixed(2)} €`])
    )
  );
};

module.exports = { ...handlers };
