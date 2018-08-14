/**
 * @overview Tests for the date util module.
 */

const util = require('../src/util/date');

describe('formatting dates', () => {
  test('formats date correctly', () => {
    const formatted = util.formatDate(new Date(2018, 0, 1));
    expect(formatted).toBe('1 Jan 2018');
  });

  test('formats datetime correctly', () => {
    const formatted = util.formatDateTime(new Date(2018, 0, 1, 21, 0));
    expect(formatted).toBe('1 Jan 2018 21:00');
  });
});

describe('parsing dates', () => {
  test('parses a valid date correctly', () => {
    const parsed = util.parseDate('1 Jan 2018');
    expect(parsed.getTime()).toBe(new Date(2018, 0, 1, 0, 0, 0, 0).getTime());
  });

  test('parses a valid datetime correctly', () => {
    const parsed = util.parseDate('1 Jan 2018 09:10');
    expect(parsed.getTime()).toBe(new Date(2018, 0, 1, 9, 10, 0, 0).getTime());
  });

  test('throws if invalid input', () => {
    expect(() => util.parseDate('hello world')).toThrow();
    expect(() => util.parseDate('32 Jan 2018')).toThrow();
    expect(() => util.parseDate('1 Not 2018')).toThrow();
    expect(() => util.parseDate('1 Jan -2018')).toThrow();
    expect(() => util.parseDate('1 Jan 2018 1:00')).toThrow();
    expect(() => util.parseDate('1 Jan 2018 25:00')).toThrow();
    expect(() => util.parseDate('1 Jan 2018 09:5')).toThrow();
    expect(() => util.parseDate('1 Jan 2018 09:60')).toThrow();
  });
});
