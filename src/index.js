const minimist = require('minimist');
const initPlugins = require('./plugins');
const { createContext } = require('./modules/context');

const args = minimist(process.argv.slice(2));
const context = createContext();

// Initialise plugins
initPlugins(context);

// Show documentation if needed
const command = args._.join('.');

const requestsHelp = args.help || args.h;
const isValidCommand = context.commands.isValid(command);

if (requestsHelp || !isValidCommand) {
  process.stdout.write(context.commands.getHelp(command));
  process.exit();
}

// Execute the wanted command
context.commands.execute(command, args, context);
