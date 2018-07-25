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

  /** Get salary for a project or for all projects. */
  getSalary(project) {
    return Object.entries(this[_config].projects)
      .filter(([name]) => !project || name === project)
      .map(([name, { salaries }]) => ({
        project: name,
        salary: salaries.slice(-1)[0].salary,
      }));
  }

  /** Add a new entry for a project. */
  addEntry(project, from, to) {
    this[_config].entries.push({ timestamp: Date.now(), project, from, to });
    this.emit('save', this[_config]);
  }
};
