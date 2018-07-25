/**
 * @overview A class for reading and writing to a time tracker configuration.
 */

const EventEmitter = require('events');

const _config = Symbol('config');

module.exports = class Tracker extends EventEmitter {
  constructor(config) {
    super();
    this[_config] = config;
  }

  /** Make sure that a project has been initialised. */
  _ensureProject(project) {
    const initial = {
      salaries: [],
    };

    if (!this[_config].projects[project]) {
      this[_config].projects[project] = initial;
    }
  }

  /** Append a new salary entry for a project. */
  setSalary(project, salary) {
    this._ensureProject(project);

    this[_config].projects[project].salaries.push({
      timestamp: Date.now(),
      salary: Math.round(salary * 100) / 100,
    });

    this.emit('save', this[_config]);
  }

  /** Get current salary for all projects. */
  getSalaries() {
    Object.entries(this[_config].projects).map(([name, { salaries }]) => {
      const currentSalary = salaries.length
        ? salaries.slice(-1)[0].salary
        : null;

      return {
        project: name,
        salaryPerMonth: currentSalary,
        salaryPerHour: currentSalary && (currentSalary * 12) / 1719,
      };
    });
  }

  /** Get current salary for a project. */
  getSalary(name) {
    const project = this[_config].projects[name];

    if (!project || !project.salaries.length) {
      return null;
    }

    const currentSalary = project.salaries.slice(-1)[0].salary;

    return {
      salaryPerMonth: currentSalary,
      salaryPerHour: (currentSalary * 12) / 1719,
    };
  }

  /** Add a new entry for a project. */
  addEntry(project, from, to) {
    this[_config].entries.push({ timestamp: Date.now(), project, from, to });
    this.emit('save', this[_config]);
  }
};
