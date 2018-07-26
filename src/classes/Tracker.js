/**
 * @overview A class for reading and writing to a time tracker data store.
 */

const EventEmitter = require('events');
const ow = require('ow');

module.exports = class Tracker extends EventEmitter {
  constructor(data) {
    super();

    this._data = { ...data };
  }

  addEntry({ labels, duration, money }) {
    ow(labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(duration, ow.number.greaterThan(0));

    if (typeof money === 'number') ow(money, ow.number.greaterThan(0));

    const timestamp = Date.now();
    const entry = { timestamp, labels, duration, money };

    this._data.entries.push({ ...entry });

    delete entry.labels;

    labels.forEach(label => {
      const entries = this._data.entriesByLabel[label] || [];
      this._data.entriesByLabel[label] = [...entries, entry];
    });

    this.emit('save', this._data);
  }
};
