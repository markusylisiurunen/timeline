/**
 * @description Utility functions.
 */

const table = require('@markusylisiurunen/md-table');

// Formatting

const formatTime = nums => nums.map(num => num.toString().padStart(2, '0')).join(':');

const formatTimeDifference = diff => {
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff - hours * 60 * 60 * 1000) / (60 * 1000));

  return formatTime([hours, minutes]);
};

// Parsing

const parseTimeString = time => {
  const timeRegex = /([0-9]{1,2}):([0-9]{2})/;
  const parsed = timeRegex.exec(time);
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

const parseDuration = duration => {
  const [hours, minutes] = duration.split(':').map(n => parseInt(n, 10));
  return (hours * 60 + minutes) * 60 * 1000;
};

// Tables

const tableBuild = (header, content, options = {}) => {
  const defaults = {
    x: 4,
    y: 1,
    colors: {
      head: '#eecc99',
      border: '#555555',
    },
  };

  return table(header, content, { ...defaults, ...options });
};

const tableEntries = entries => {
  const header = ['From', 'To', 'Duration', 'Label(s)', 'Money'];
  const options = { alignRight: [0, 1, 2, 4] };

  const rows = entries.map(({ from, to, labels, money }) => {
    const fromString = formatTime([from.getHours(), from.getMinutes()]);
    const toString = formatTime([to.getHours(), to.getMinutes()]);

    const duration = formatTimeDifference(to.getTime() - from.getTime());
    const moneyString = money ? `${money.toFixed(2)} €` : '-';

    return [fromString, toString, duration, labels.join(', '), moneyString];
  });

  return tableBuild(header, rows, options);
};

// Salaries

const salaryNormalise = salary => (salary <= 400 ? salary : (salary * 12) / 1719);

module.exports = {
  formatTime,
  formatTimeDifference,
  parseTimeString,
  parseDuration,
  tableBuild,
  tableEntries,
  salaryNormalise,
};
