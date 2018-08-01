#!/usr/bin/env node

const minimist = require('minimist');
const Configstore = require('configstore');
const pkg = require('../package.json');
const Timeline = require('./Timeline');

const args = minimist(process.argv.slice(2));

const config = new Configstore(pkg.name, {});
const timeline = new Timeline(config.all.events || []);

// Initialise plugins
const plugins = [require('./plugins/work'), require('./plugins/google-calendar')];

plugins.forEach(plugin => plugin(args, config, timeline));

// Show documentation for a command if needed
const command = args._.join('.');

if (args.help || args.h || !args._.length || !timeline.hasCommand(command)) {
  const documentation = timeline.getDocumentation(command);

  process.stdout.write(documentation || 'Invalid command.\n');
  process.exit();
}

// Execute the wanted command
timeline.executeCommand(command);
