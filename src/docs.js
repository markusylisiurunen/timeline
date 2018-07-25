/**
 * @overview Documentation for the package.
 */

/** Build a doc section. */
const section = (header, lines, format) => {
  const result = ['', `${header}:`, ''];
  lines.forEach(line => result.push(`  ${format(line)}`));
  return result;
};

/**
 * Build a documentation block for a command.
 */
const doc = ({ usage, commands, options, examples }) => {
  let lines = [];

  lines.push(`Usage: ${usage}`);

  if (Array.isArray(commands) && commands.length) {
    lines.push(
      ...section('Commands', commands, c => `${c.name}  ${c.description}`)
    );
  }

  if (Array.isArray(options) && options.length) {
    lines.push(
      ...section(
        'Options',
        options,
        o => `-${o.short}, --${o.long}  ${o.description}`
      )
    );
  }

  if (Array.isArray(examples) && examples.length) {
    lines.push(...section('Examples', examples, e => `$ ${e}`));
  }

  return ['', ...lines, ''].join('\n');
};

const commands = {
  default: doc({
    usage: 'my-time-tracker <command> [options]',
    commands: [
      {
        name: 'salary',
        description: 'manage project salaries',
      },
      {
        name: 'live',
        description: 'record a live entry',
      },
    ],
    options: [
      {
        short: 'h',
        long: 'help',
        description: 'output help information',
      },
    ],
    examples: ['my-time-tracker -h', 'my-time-tracker salary --help'],
  }),
  salary: doc({
    usage: 'my-time-tracker salary [options]',
    commands: [
      {
        name: 'get',
        description: "get project's salary",
      },
      {
        name: 'set',
        description: "set project's salary",
      },
    ],
    options: [
      {
        short: 'p',
        long: 'project',
        description: 'project to get/set its salary',
      },
      {
        short: 's',
        long: 'salary',
        description: 'salary per month',
      },
    ],
    examples: [
      'my-time-tracker salary get',
      'my-time-tracker salary get --project freelancing',
      'my-time-tracker salary set --project freelancing --salary 3250',
    ],
  }),
  live: doc({
    usage: 'my-time-tracker live [options]',
    options: [
      {
        short: 'p',
        long: 'project',
        description: 'project to record for',
      },
      {
        short: 'f',
        long: 'from',
        description: 'starting from (time)',
      },
    ],
    examples: ['my-time-tracker live --project freelancing --from 9:25'],
  }),
};

module.exports = name => commands[name] || commands.default;
