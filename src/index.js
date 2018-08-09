#!/usr/bin/env node

const minimist = require('minimist');
const initPlugins = require('./plugins');
const { createContext } = require('./modules/context');

const args = minimist(process.argv.slice(2));
const context = createContext();

const main = async () => {
  // Initialise plugins
  initPlugins(args, context);

  await context.lifecycle.emit('init');

  // Show documentation if needed
  const command = args._.join('.');

  const requestsHelp = args.help || args.h;
  const isValidCommand = context.commands.isValid(command);

  if (requestsHelp || !isValidCommand) {
    process.stdout.write(context.commands.help(command));
    process.exit();
  }

  await context.lifecycle.emit('preCommand');

  // Execute the wanted command
  context.commands.execute(command, args, context);

  await context.lifecycle.emit('postCommand');
};

main();
