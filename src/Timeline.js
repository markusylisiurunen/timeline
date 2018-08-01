/**
 * @overview Timeline class for tracking different types of events.
 *
 * Timeline consists of an array of events which follow a common data structure. Events can be of
 * any type but they still have to have the common event fields. The event data type is described
 * below.
 *
 * {
 *   "id": "String <unique identifier>",
 *   "type": "String <type of this event>",
 *   "timestamp": "Number <timestamp for this event>",
 *   "labels": "String[] <labels for this event>",
 *   "data": "Object <the body of data for this type of event>"
 * }
 */

const EventEmitter = require('events');
const uuidv1 = require('uuid/v1');
const ow = require('ow');

class Timeline extends EventEmitter {
  /**
   * @param {Object} _               Initialisation data.
   * @param {Array}  _.events        All events in a chronological order.
   * @param {Object} _.eventsById    Events by id for faster access.
   * @param {Object} _.eventsByType  Events by type.
   * @param {Object} _.eventsByLabel Events by label..
   * @constructor
   */
  constructor({ events = [], eventsById = {}, eventsByType = {}, eventsByLabel = {} } = {}) {
    super();

    this._timeline = { events, eventsById, eventsByType, eventsByLabel };
  }

  /**
   * Apply options to an array of events.
   * @param  {Array}  events          An array of events.
   * @param  {Object} [options]       Options to filter events.
   * @param  {Number} [options.since] Filter events to only those after this timestamp.
   * @param  {Number} [options.until] Filter events to only those before this timestamp.
   * @return {Array}                  An array of matched events.
   */
  _getEvents(events, options = {}) {
    ow(options.since, ow.any(ow.undefined, ow.number.greaterThanOrEqual(0)));
    ow(options.until, ow.any(ow.undefined, ow.number.greaterThanOrEqual(0)));

    let result = [...events];

    if (!options.since && !options.until) {
      return result;
    }

    // Filter before `since`
    if (options.since) {
      while (result.length) {
        if (result[0].timestamp >= options.since) break;
        result.splice(0, 1);
      }
    }

    // Filter after `until`
    if (options.until) {
      while (result.length) {
        if (result.slice(-1)[0].timestamp <= options.until) break;
        result.splice(result.length - 1, 1);
      }
    }

    return result;
  }

  /**
   * Add event to an array of events sorted by the timestamp.
   * @param {Object} event Event to be added.
   * @param {Array}  arr   Array of events.
   */
  _addEventToCorrectIndex(event, arr) {
    let index = arr.length - 1;

    while (true) {
      if (index === -1 || arr[index].timestamp <= event.timestamp) {
        arr.splice(index + 1, 0, event);
        break;
      }

      index -= 1;
    }
  }

  /**
   * Get events from the list of all events.
   * @param  {Object} [options] Options for filtering events.
   * @return {Array}            An array of matched events.
   */
  get(options) {
    return this._getEvents(this._timeline.events, options);
  }

  /**
   * Get events by its type.
   * @param  {String} type      The type to filter by.
   * @param  {Object} [options] Options for filtering events.
   * @return {Array}            An array of matched events.
   */
  getByType(type, options) {
    ow(type, ow.string.minLength(1));
    return this._getEvents(this._timeline.eventsByType[type] || [], options);
  }

  /**
   * Get events by its label.
   * @param  {String} label     The label to filter by.
   * @param  {Object} [options] Options for filtering events.
   * @return {Array}            An array of matched events.
   */
  getByLabel(label, options) {
    ow(label, ow.string.minLength(1));
    return this._getEvents(this._timeline.eventsByLabel[label] || [], options);
  }

  /**
   * Add a new event to the timeline.
   * @param {String} type      Type of event.
   * @param {Array}  labels    Labels for the event.
   * @param {Number} timestamp Timestamp for the event.
   * @param {Object} [data]    Data for the event.
   */
  add(type, timestamp, labels, data = null) {
    // Validate parameters
    ow(type, ow.string.minLength(1));
    ow(timestamp, ow.number.greaterThan(0));
    ow(labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));

    const event = { id: uuidv1(), type, timestamp, labels, data };

    // Add the event to the data structure
    this._timeline.eventsById[event.id] = event;

    this._addEventToCorrectIndex(event, this._timeline.events);

    if (!this._timeline.eventsByType[type]) {
      this._timeline.eventsByType[type] = [];
    }

    this._addEventToCorrectIndex(event, this._timeline.eventsByType[type]);

    labels.forEach(label => {
      if (!this._timeline.eventsByLabel[label]) {
        this._timeline.eventsByLabel[label] = [];
      }

      this._addEventToCorrectIndex(event, this._timeline.eventsByLabel[label]);
    });

    // Trigger the `save` event so that the updated timeline can be saved to eg. database
    this.emit('save', this._timeline);
  }

  /**
   * Remove an event from the timeline.
   * @param {String} id Id of the event to remove.
   */
  remove(id) {
    if (!this._timeline.eventsById[id]) return;

    const { type, labels } = this._timeline.eventsById[id];

    // Delete the event from the data structure
    delete this._timeline.eventsById[id];

    const index = this._timeline.events.findIndex(e => e.id === id);
    this._timeline.events.splice(index, 1);

    const indexByType = this._timeline.eventsByType[type].findIndex(e => e.id === id);
    this._timeline.eventsByType[type].splice(indexByType, 1);

    labels.forEach(label => {
      const indexByLabel = this._timeline.eventsByLabel[label].findIndex(e => e.id === id);
      this._timeline.eventsByLabel[label].splice(indexByLabel, 1);
    });
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

    ow(since, ow.any(ow.null, ow.number.greaterThanOrEqual(0)));

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
}

module.exports = Timeline;
