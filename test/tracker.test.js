/**
 * @overview Tests for the `Tracker` class.
 */

const Tracker = require('../src/classes/Tracker');

const durationToTimes = duration => ({ from: Date.now() - duration, to: Date.now() });

test('adds a new entry', () => {
  const tracker = new Tracker();

  tracker.addEntry({ type: 'Test', labels: ['test_1', 'test_2'] });

  expect(tracker.getEntries()).toHaveLength(1);
  expect(tracker.getEntries()[0].labels).toEqual(['test_1', 'test_2']);
});

describe('getting and manipulating entries', () => {
  let tracker = new Tracker();
  const entries = [
    { type: 'Test1', timestamp: 10, labels: ['test_1'], data: { money: 10 } },
    { type: 'Test2', timestamp: 20, labels: ['test_2'], data: { money: 5 } },
    { type: 'Test1', timestamp: 30, labels: ['test_1'], data: { money: 10 } },
    { type: 'Test1', timestamp: 40, labels: ['test_1'], data: { money: 10 } },
    { type: 'Test2', timestamp: 50, labels: ['test_2'], data: { money: 5 } },
  ];

  entries.forEach(entry => tracker.addEntry(entry));

  test('gets all entries', () => {
    expect(tracker.getEntries()).toHaveLength(entries.length);
  });

  test('gets all entries since a timestamp', () => {
    expect(tracker.getEntries({ since: 45 })).toHaveLength(
      entries.filter(entry => entry.timestamp >= 45).length
    );
  });

  test('gets entries for a type', () => {
    expect(tracker.getEntriesByType('Test1')).toHaveLength(
      entries.filter(entry => entry.type === 'Test1').length
    );
  });

  test('gets entries for a type since a timestamp', () => {
    expect(tracker.getEntriesByType('Test1', { since: 45 })).toHaveLength(
      entries.filter(entry => entry.type === 'Test1' && entry.timestamp >= 45).length
    );
  });

  test('gets entries for a label', () => {
    expect(tracker.getEntriesByLabel('test_1')).toHaveLength(
      entries.filter(entry => entry.labels.includes('test_1')).length
    );
  });

  test('gets entries for a label since a timestamp', () => {
    expect(tracker.getEntriesByLabel('test_1', { since: 45 })).toHaveLength(
      entries.filter(entry => entry.labels.includes('test_1') && entry.timestamp >= 45).length
    );
  });

  test('MapReduces entries since a timestamp', () => {
    const monies = entries.reduce(
      (sums, entry) => ({ ...sums, [entry.labels[0]]: sums[entry.labels[0]] + entry.data.money }),
      { test_1: 0, test_2: 0 }
    );

    const result = tracker.mapReduce(
      entry => entry.labels[0],
      ({ money }, entry) => ({ money: (money || 0) + entry.data.money })
    );

    expect(result.test_1.money).toBe(monies.test_1);
    expect(result.test_2.money).toBe(monies.test_2);
  });
});
