/**
 * @overview Add
 */

const ow = require('ow');
const validators = require('../util/validators');
const docs = require('../util/docs');

// Utility functions

/**
 * Convert salary to hourly based salary.
 */
const normaliseSalary = salary => (salary <= 100 ? salary : salary / 158);

// Documentation

// prettier-ignore
const documentation = {
  add: docs.wrap([
    docs.block.text('Usage: timeline work add [options]'),
    docs.block.text('Add a new work event to the timeline.'),
    docs.block.list('Options', [
      ['-l, --label',       'required', 'Label(s) for the event'],
      ['-d, --description', 'required', 'Description of the event'],
      ['-s, --salary',      'required', 'Salary (0-100 is hourly, otherwise monthly)'],
      ['-f, --from',        'required', 'Starting time for the event'],
      ['-t, --to',          'required', 'Ending time for the event'],
    ]),
    docs.block.list('Examples', [
      ['$', 'timeline work add -l writing -l book_1 -s 2500 -d "First chapter" -f "10:45 AM" -t "3:30 PM"'],
    ]),
  ]),
};

// Commands

/**
 * Add a new entry to the timeline.
 */
const add = (args, config, timeline) => {
  const flags = {
    label: args.label || args.l,
    description: args.description || args.d,
    salary: args.salary || args.s,
    from: args.from || args.f,
    to: args.to || args.t,
  };

  if (!Array.isArray(flags.label)) {
    flags.label = [flags.label];
  }

  // Validate flags
  ow(flags.label, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
  ow(flags.description, ow.string.minLength(1));
  ow(flags.salary, ow.number.greaterThanOrEqual(0));
  ow(flags.from, ow.string.matches(validators.dateTime));
  ow(flags.to, ow.string.matches(validators.dateTime));

  const from = Date.parse(flags.from);
  const to = Date.parse(flags.to);
  const hours = (to - from) / 3.6e6;

  const salaryPerHour = normaliseSalary(flags.salary);
  const earnings = hours * salaryPerHour;

  timeline.add('work', flags.label, flags.description, from, to, { earnings });

  console.log('Done.');
};

module.exports = (args, config, timeline) => {
  const commands = {
    add: add.bind(null, args, config),
  };

  // Register commands for this plugin
  Object.entries(commands).forEach(([name, handler]) =>
    timeline.registerCommand(`work.${name}`, handler, documentation[name])
  );
};
