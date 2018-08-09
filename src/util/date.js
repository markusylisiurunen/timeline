/**
 * @overview Helpers for dates.
 */

/**
 * Format a date to a human input format.
 * @param  {Date}   date Date to format.
 * @return {String}      Formatted date.
 */
const formatDate = date => {
  // prettier-ignore
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

module.exports = { formatDate };
