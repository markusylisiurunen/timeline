/**
 * @overview Timeline class for placing events on a timeline.
 *
 * Timeline consists of an array of events which follow a common data structure. Events can be of
 * any type but they must follow the common event interface, as shown below.
 *
 * {
 *   "id": "String <unique identifier>",
 *   "type": "String <type of this event>",
 *   "from": "Number <timestamp for the start of this event>",
 *   "to": "Number <timestamp for the end of this event>",
 *   "labels": "String[] <labels for this event>",
 *   "description": "String <description for this event>",
 *   "data": "Object? <the body of data for this type of event>"
 * }
 */

const EventEmitter = require('events');
const uuidv1 = require('uuid/v1');
const ow = require('ow');

class Timeline extends EventEmitter {
  /**
   * @param {Array} [events] Events already on the timeline.
   * @constructor
   */
  constructor(events = []) {
    super();

    // For plugins to register commands
    this._commands = {};

    // Initialise the data for the events
    this._timeline = events;

    const { byId, byType, byLabel } = this._timeline.reduce(
      (acc, event) => {
        const { id, type } = event;

        acc.byId[id] = event;
        acc.byType[type] = [...(acc.byType[type] || []), event];

        event.labels.forEach(label => {
          acc.byLabel[label] = [...(acc.byLabel[label] || []), event];
        });
      },
      { byId: {}, byType: {}, byLabel: {} }
    );

    this._eventsById = byId;
    this._eventsByType = byType;
    this._eventsByLabel = byLabel;
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
        if (result[0].from >= options.since) break;
        result.splice(0, 1);
      }
    }

    // Filter after `until`
    if (options.until) {
      while (result.length) {
        if (result.slice(-1)[0].from <= options.until) break;
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
      if (index === -1 || arr[index].from <= event.from) {
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
    return this._getEvents(this._timeline, options);
  }

  /**
   * Get events by its type.
   * @param  {String} type      The type to filter by.
   * @param  {Object} [options] Options for filtering events.
   * @return {Array}            An array of matched events.
   */
  getByType(type, options) {
    ow(type, ow.string.minLength(1));
    return this._getEvents(this._eventsByType[type] || [], options);
  }

  /**
   * Get events by its label.
   * @param  {String} label     The label to filter by.
   * @param  {Object} [options] Options for filtering events.
   * @return {Array}            An array of matched events.
   */
  getByLabel(label, options) {
    ow(label, ow.string.minLength(1));
    return this._getEvents(this._eventsByLabel[label] || [], options);
  }

  /**
   * Add a new event to the timeline.
   * @param {String} type        Type of event.
   * @param {Array}  labels      Labels for the event.
   * @param {String} description Description for the event.
   * @param {Number} from        Starting time for the event.
   * @param {Number} to          Ending time for the event.
   * @param {Object} [data]      Data for the event.
   */
  add(type, labels, description, from, to, data = null) {
    // Validate parameters
    ow(type, ow.string.minLength(1));
    ow(labels, ow.array.nonEmpty.ofType(ow.string.minLength(1)));
    ow(description, ow.string.minLength(1));
    ow(from, ow.number.greaterThan(0));
    ow(to, ow.number.greaterThan(0));

    const event = { id: uuidv1(), type, labels, description, from, to, data };

    // Add the event to the data structure
    this._eventsById[event.id] = event;

    this._addEventToCorrectIndex(event, this._timeline);

    if (!this._eventsByType[type]) {
      this._eventsByType[type] = [];
    }

    this._addEventToCorrectIndex(event, this._eventsByType[type]);

    labels.forEach(label => {
      if (!this._eventsByLabel[label]) {
        this._eventsByLabel[label] = [];
      }

      this._addEventToCorrectIndex(event, this._eventsByLabel[label]);
    });

    // Trigger the `save` event so that the updated timeline can be saved to eg. database
    this.emit('save', this._timeline);
  }

  /**
   * Remove an event from the timeline.
   * @param {String} id Id of the event to remove.
   */
  remove(id) {
    if (!this._eventsById[id]) return;

    const { type, labels } = this._eventsById[id];

    // Delete the event from the data structure
    delete this._eventsById[id];

    const index = this._timeline.findIndex(e => e.id === id);
    this._timeline.splice(index, 1);

    const indexByType = this._eventsByType[type].findIndex(e => e.id === id);
    this._eventsByType[type].splice(indexByType, 1);

    labels.forEach(label => {
      const indexByLabel = this._eventsByLabel[label].findIndex(e => e.id === id);
      this._eventsByLabel[label].splice(indexByLabel, 1);
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
