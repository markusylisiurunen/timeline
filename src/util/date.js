/**
 * @overview Utility functions for dates.
 */

const ow = require('ow');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parse Date to an object.
 * @param  {Date}   date Date to parse.
 * @return {Object}      Parsed date object.
 */
const _parseDateToObject = date => ({
  year: date.getFullYear(),
  month: MONTHS[date.getMonth()],
  day: date.getDate(),
  hours: String(date.getHours()).padStart(2, '0'),
  minutes: String(date.getMinutes()).padStart(2, '0'),
});

/**
 * Format a Date to a human date input format.
 * @param  {Date}   date Date to format.
 * @return {String}      Formatted date.
 */
const formatDate = date => {
  const { year, month, day } = _parseDateToObject(date);
  return `${day} ${month} ${year}`;
};

/**
 * Format a date to a human datetime input format.
 * @param  {Date}   date Date to format.
 * @return {String}      Formatted datetime.
 */
const formatDateTime = date => {
  const { year, month, day, hours, minutes } = _parseDateToObject(date);
  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

/**
 * Parse a human input date/datetime.
 * @param  {String} input Input to parse.
 * @return {Date}         Parsed Date.
 */
const parseDate = input => {
  // prettier-ignore
  ow(input, ow.string.matches(/^([1-9]|1[0-9]|2[0-9]|3[0-1]) \w{3} [0-9]{0,4}( (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])?$/));
  const date = Date.parse(input);
  ow(date, ow.number.greaterThan(0));
  return new Date(date);
};

module.exports = { formatDate, formatDateTime, parseDate };
