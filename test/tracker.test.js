/**
 * @overview Tests for the `Tracker` class.
 */

const Tracker = require('../src/classes/Tracker');

const durationToTimes = duration => ({ from: Date.now() - duration, to: Date.now() });

test('adds a new entry', () => {
  const tracker = new Tracker();

  tracker.addEntry({ type: 'Test', labels: ['test_1', 'test_2'] });

  expect(tracker.getAllEntries()).toHaveLength(1);
  expect(tracker.getAllEntries()[0].labels).toEqual(['test_1', 'test_2']);
});

test('gets entries since a timestamp', () => {
  const tracker = new Tracker();

  [
    { type: 'Test', timestamp: 50, labels: ['test_1'] },
    { type: 'Test', timestamp: 100, labels: ['test_1'] },
  ].forEach(entry => tracker.addEntry(entry));

  expect(tracker.getEntriesSince(75)).toHaveLength(1);
});

test('groups entries by label and gets total earned money', () => {
  const tracker = new Tracker();

  [
    { type: 'Test', labels: ['test_1'], data: { money: 10 } },
    { type: 'Test', labels: ['test_1'], data: { money: 5 } },
    { type: 'Test', labels: ['test_2'], data: { money: 25 } },
    { type: 'Test', labels: ['test_2'], data: { money: 10 } },
  ].forEach(entry => tracker.addEntry(entry));

  const result = tracker.mapReduce(
    entry => entry.labels[0],
    ({ money }, entry) => ({ money: (money || 0) + entry.data.money })
  );

  expect(result.test_1.money).toBe(15);
  expect(result.test_2.money).toBe(35);
});
