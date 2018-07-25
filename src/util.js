/**
 * @description Utility functions.
 */

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

/**
 * Parse a time string (format hh:mm) to a unix timestamp.
 * @param  {String} timeString Time string to parse.
 * @return {Number}            Unix timestamp for the time.
 */
const parseTimeString = timeString => {
  const timeRegex = /([0-9]{1,2}):([0-9]{1,2})/;
  const parsed = timeRegex.exec(timeString);
  const now = new Date();

  if (!parsed) {
    throw new Error('Invalid time string.');
  }

  const [, hours, minutes] = parsed;

  now.setHours(parseInt(hours, 10));
  now.setMinutes(parseInt(minutes, 10));
  now.setSeconds(0);

  return now.getTime();
};

/**
 * Parse time difference from milliseconds.
 * @param  {Number} timeDiff Time difference to parse.
 * @return {Object}          Object with hours, minutes and seconds set.
 */
const parseTimeDiff = timeDiff => {
  const hours = Math.floor(timeDiff / HOUR);
  const minutes = Math.floor((timeDiff - hours * HOUR) / MINUTE);
  const seconds = Math.floor(
    (timeDiff - hours * HOUR - minutes * MINUTE) / SECOND
  );

  return { hours, minutes, seconds };
};

/**
 * Format time diff into a human readable string.
 * @param  {Number}  timeDiff        Time difference to format.
 * @param  {Boolean} includeSeconds  Whether to include seconds.
 * @return {String}                  A human readable string of the time diff.
 */
const formatTimeDiff = (diff, includeSeconds) => {
  const { hours, minutes, seconds } = parseTimeDiff(Math.abs(diff));
  let line = `${diff < 0 ? '-' : ''}${hours} hours ${minutes} minutes`;

  if (includeSeconds) {
    line += ` ${seconds} seconds`;
  }

  return line;
};

/**
 * Calculate the earned money,
 * @param  {Number} time   Spent time in milliseconds.
 * @param  {Number} salary Salary per month.
 * @return {Number}        Earned money.
 */
const calculateEarnings = (time, salary) => {
  const salaryPerHour = (salary * 12) / 1719;
  return (time / (60 * 60 * 1000)) * salaryPerHour;
};

module.exports = {
  parseTimeString,
  parseTimeDiff,
  formatTimeDiff,
  calculateEarnings,
};
