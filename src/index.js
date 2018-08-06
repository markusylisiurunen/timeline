#!/usr/bin/env node

const minimist = require('minimist');
const Configstore = require('configstore');
const Timeline = require('./Timeline');
const config = require('./config');

const args = minimist(process.argv.slice(2));

const configstore = new Configstore(config.name, {});
const timeline = new Timeline(configstore.all.events || []);

timeline.on('event.add', timeline => configstore.set('events', timeline.get()));

// Initialise plugins
require('./plugins')(args, configstore, timeline);

// Show documentation for a command if needed
const command = args._.join('.');

if (args.help || args.h || !args._.length || !timeline.hasCommand(command)) {
  const documentation = timeline.getDocumentation(command);

  process.stdout.write(documentation || 'Invalid command.\n');
  process.exit();
}

// Execute the wanted command
timeline.executeCommand(command);
