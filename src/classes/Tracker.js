/**
 * @overview A class for keeping track of work entries.
 *
 * The tracker is capable of keeping track of different types of entries. However, every entry still
 * follows the basic structure as shown below.
 *
 * {
 *   "_id": "string <unique identifier of the entry>"
 *   "type": "string <type of this entry>",
 *   "labels": "string[] <labels for this entry>",
 *   "timestamp": "number <timestamp to be able to sort entries>",
 *   "data": "object <data for this type of entry>"
 * }
 */

const EventEmitter = require('events');
const ow = require('ow');
const uuidv1 = require('uuid/v1');

module.exports = class Tracker extends EventEmitter {
  /**
   * @param {Object} _                Initialisation data.
   * @param {Array}  _.entries        All entries in a chronological order.
   * @param {Object} _.entriesById    Entries by id for faster access.
   * @param {Object} _.entriesByType  Entries grouped by type.
   * @param {Object} _.entriesByLabel Entries grouped by label.
   * @constructor
   */
  constructor({ entries = [], entriesById = {}, entriesByType = {}, entriesByLabel = {} } = {}) {
    super();
    this._data = { entries, entriesById, entriesByType, entriesByLabel };
  }

  /**
   * Get entries since a timestamp.
   * @param  {Array}  entries An array of entries to filter.
   * @param  {Number} since   Timestamp to filter entries by.
   * @return {Array}          An array of matched entries.
   */
  _filterSince(entries, since) {
    const result = [];
    let i = entries.length - 1;

    while (i !== -1) {
      if (entries[i].timestamp < since) break;

      result.unshift(entries[i]);
      i -= 1;
    }

    return result;
  }

  /**
   * Get entries.
   * @param  {Object} [options]       Options.
   * @param  {Number} [options.since] Filter entries to only those added after `since`.
   * @return {Array}                  An array of matched entries.
   */
  getEntries({ since = null } = {}) {
    let entries = this._data.entries;

    if (since) {
      entries = this._filterSince(entries, since);
    }

    return entries;
  }

  /**
   * Get entries by type.
   * @param  {String} type            The type to filter by.
   * @param  {Object} [options]       Options.
   * @param  {Number} [options.since] Filter entries to only those added after `since`.
   * @return {Array}                  An array of matched entries.
   */
  getEntriesByType(type, { since = null } = {}) {
    let entries = this._data.entriesByType[type] || [];

    if (since) {
      entries = this._filterSince(entries, since);
    }

    return entries;
  }

  /**
   * Get entries by label.
   * @param  {String} label           The label to filter by.
   * @param  {Object} [options]       Options.
   * @param  {Number} [options.since] Filter entries to only those added after `since`.
   * @return {Array}                  An array of matched entries.
   */
  getEntriesByLabel(label, { since = null } = {}) {
    let entries = this._data.entriesByLabel[label] || [];

    if (since) {
      entries = this._filterSince(entries, since);
    }

    return entries;
  }

  /**
   * Add a new entry.
   * @param {Object} _             Entry.
   * @param {String} _.type        Type for the entry.
   * @param {Array}  _.labels      Labels for the entry.
   * @param {Number} [_.timestamp] Timestamp for the entry.
   * @param {Object} [_.data]      Data for the entry.
   */
  addEntry({ type, labels, timestamp = Date.now(), data = {} } = {}) {
    // Validate arguments
    ow(type, ow.string.minLength(1));
    ow(labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(timestamp, ow.number.greaterThan(0));

    // Construct the new entry
    const entry = { _id: uuidv1(), type, labels, timestamp, data };

    // Ensure the type and label are created
    this._data.entriesByType[type] = this._data.entriesByType[type] || [];

    labels.forEach(label => {
      this._data.entriesByLabel[label] = this._data.entriesByLabel[label] || [];
    });

    // Insert the entry to the data structure
    this._data.entries.push(entry);
    this._data.entriesById[entry._id] = entry;
    this._data.entriesByType[type].push(entry);

    labels.forEach(label => this._data.entriesByLabel[label].push(entry));

    // Trigger the `save` event so that the updated data can be saved to eg. database
    this.emit('save', this._data);
  }

  /**
   * Run MapReduce since a specified timestamp.
   * @param  {Function} map             Map each entry to a key.
   * @param  {Function} reduce          Reduce each group to a single object value.
   * @param  {Object}   [options]       Options.
   * @param  {Number}   [options.since] Filter entries to only those added after `since`.
   * @return {Object}                   The MapReduced result.
   */
  mapReduce(map, reduce, { since = null } = {}) {
    // Validate arguments
    ow(map, ow.function);
    ow(reduce, ow.function);

    ow(since, ow.number.greaterThanOrEqual(0));

    // The result of MapReduce
    let result = {};

    // Map
    let i = this._data.entries.length - 1;

    while (i !== -1) {
      const entry = this._data.entries[i];

      // Stop if "since" restriction not true anymore
      if (since && entry.timestamp < since) break;

      // Map the entry to a key
      const key = map(entry);
      result[key] = [...(result[key] || []), entry];

      i -= 1;
    }

    // Reduce
    Object.keys(result).forEach(key => {
      result[key] = result[key].reduce((temp, entry) => reduce(temp, entry), {});
    });

    return result;
  }
};
