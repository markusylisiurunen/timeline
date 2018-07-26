/**
 * @overview Documentation for the package.
 */

// Components

const block = content => ['', content].join('\n');

const list = (title, rows) => {
  const result = [`${title}:`, ''];
  const longest = Math.max(...rows.map(([first]) => first.length));

  rows.forEach(row => result.push(`  ${row[0].padEnd(longest)}  ${row[1]}`));

  return result.join('\n');
};

// Command documentations
const docs = {};

docs['default'] = [
  block('Usage: my-time-tracker <command> [<subcommand>...] [options]'),
  block(list('Commands', [['entry', 'Manage recorded entries']])),
  block(list('Options', [['-h, --help', 'Output help information']])),
].join('\n');

docs['entry'] = [
  block('Usage: my-time-tracker entry <command> [options]'),
  block(list('Commands', [['add', 'Add a new entry']])),
].join('\n');

docs['entry.add'] = [
  block('Usage: my-time-tracker entry add [options]'),
  block(
    list('Options', [
      ['-l, --label', 'Label(s) for the entry'],
      ['-d, --duration', 'Duration of the entry'],
      ['-m, --money', 'Earned money during the entry'],
    ])
  ),
].join('\n');

docs['live'] = [
  block('Usage: my-time-tracker live [options]'),
  block(
    list('Options', [
      ['-l, --label', 'Label(s) for the live entry'],
      ['-f, --from', 'Starting from'],
      ['-s, --salary', 'Salary for the live entry (0-400 => hourly, > 400 => monthly)'],
    ])
  ),
].join('\n');

module.exports = name => docs[name] || docs['default'];
