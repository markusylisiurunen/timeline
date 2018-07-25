#!/usr/bin/env node

const minimist = require('minimist');
const Configstore = require('configstore');
const docs = require('./docs');
const commands = require('./commands');
const Tracker = require('./classes/Tracker');

const pkg = require('../package.json');

// Initialise the tracker
const config = new Configstore(pkg.name, { projects: {}, entries: [] });
const tracker = new Tracker(config.all);

tracker.on('save', data => config.set(data));

// Read the arguments passed to the program
const args = minimist(process.argv.slice(2));

// Print documentation if the -h or --help flags are present or if incorrect
// command is passed
if (args.h || args.help || !args._.length || !commands[args._[0]]) {
  console.log(docs(args._[0]));
  process.exit();
}

// Call the correct command handler
commands[args._[0]](args, tracker).catch(e => console.log(e.toString()));
