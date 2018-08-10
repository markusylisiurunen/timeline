/**
 * @overview Event plugin.
 */

const ow = require('ow');
const docs = require('./docs');
const { getOptions } = require('../../util/options');

/**
 * Add a new event to the timeline.
 * @param {Object} args    Parsed arguments.
 * @param {Object} context Context object.
 */
let add = async (args, { timeline }) => {
  const options = await getOptions(args, [
    { name: 'labels', flags: ['label', 'l'], question: { message: 'Labels:' } },
    { name: 'description', flags: ['description', 'd'], question: { message: 'Description:' } },
    { name: 'from', flags: ['from', 'f'], question: { message: 'Started at:' } },
    { name: 'to', flags: ['to', 't'], question: { message: 'Ended at:' } },
  ]);

  options.labels = Array.isArray(options.labels)
    ? options.labels
    : options.labels.split(',').map(l => l.trim());

  options.from = Date.parse(options.from);
  options.to = Date.parse(options.to);

  try {
    ow(options.labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(options.description, ow.string.minLength(1));
    ow(options.from, ow.number.greaterThan(0));
    ow(options.to, ow.number.greaterThan(0));
  } catch (error) {
    console.log('Invalid options.');
    return;
  }

  timeline.add('default', options.labels, options.description, options.from, options.to);

  console.log('Done.');
};

module.exports = (args, context) => {
  const { commands } = context;

  add = add.bind(null, args, context);

  commands.register('event.add', add, docs.add);
};
