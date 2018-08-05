/**
 * @overview Helpers for salary.
 */

/**
 * Normalise salary to always be an hourly salary.
 * @param  {Number} salary Un-normalised salary (0-100 hourly, otherwise monthly).
 * @return {Number}        Normalised hourly salary.
 */
const hourlySalary = salary => (salary <= 100 ? salary : salary / 158);

module.exports = { hourlySalary };
