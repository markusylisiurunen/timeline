#!/usr/bin/env node

const minimist = require('minimist');
const log = require('single-line-log').stdout;
const mdTable = require('@markusylisiurunen/md-table');
const {
  parseTimeString,
  formatTimeDiff,
  calculateEarnings,
} = require('./util');

// Read the arguments passed to the program
const args = minimist(process.argv.slice(2));

if (!Array.isArray(args.w)) {
  args.w = [args.w];
}

/**
 * Construct the header row.
 * @return {Array} The header row.
 */
const header = () => {
  const base = ['Project', 'Spent time'];

  if (args.salary !== undefined) {
    base.push('Earned money');
  }

  return base;
};

/**
 * Construct the content rows.
 * @param  {Object} projects Spent time on projects.
 * @return {Array}           Array of content rows.
 */
const content = projects => {
  const entries = Object.entries(projects);
  const rows = entries.map(([name, time]) => [name, formatTimeDiff(time)]);

  // Create the total row
  const totalTime = entries.reduce((sum, [, time]) => sum + time, 0);
  rows.push(['Total', formatTimeDiff(totalTime)]);

  if (args.salary !== undefined) {
    return rows.map((row, i) => {
      const [project] = row;
      let time = null;

      if (project === 'Total') {
        time = totalTime;
      } else {
        time = projects[project];
      }

      return [...row, `${calculateEarnings(time, args.salary).toFixed(2)} €`];
    });
  }

  return rows;
};

/**
 * Update the printed message on stdout.
 */
const update = () => {
  const projects = args.w.reduce((acc, entry) => {
    const [project, time] = entry.replace(/\s/g, '').split('=');
    const [from, to] = time.split('-');
    const fromTime = parseTimeString(from);
    const toTime = to === 'now' ? Date.now() : parseTimeString(to);

    if (fromTime > toTime) {
      throw new Error('Times must be in chronological order.');
    }

    return { ...acc, [project]: (acc[project] || 0) + toTime - fromTime };
  }, {});

  const tableOptions = {
    x: 4,
    y: 1,
    colors: {
      head: '#eecc99',
      border: '#555555',
    },
  };

  log(mdTable(header(), content(projects), tableOptions));
};

setInterval(update, 1000);
update();
