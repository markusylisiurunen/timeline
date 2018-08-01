const Timeline = require('../src/Timeline');

describe('adding events', () => {
  let timeline = null;

  beforeEach(() => {
    timeline = new Timeline();
  });

  test('adds a single event', () => {
    timeline.add('test', ['test_1'], 'test', 1, 2);
    expect(timeline.get()).toHaveLength(1);
  });

  test('adds two events in correct order', () => {
    timeline.add('test', ['test_1'], 'test', 2, 3);
    timeline.add('test', ['test_2'], 'test', 1, 2);

    expect(timeline.get()).toHaveLength(2);
    expect(timeline.get()[0].labels).toEqual(['test_2']);
    expect(timeline.get()[1].labels).toEqual(['test_1']);
  });
});

describe('removing events', () => {
  let timeline = null;

  beforeEach(() => {
    timeline = new Timeline();

    const events = [
      { type: 'test_1', labels: ['test_1'], description: 'test', from: 1, to: 2 },
      { type: 'test_2', labels: ['test_1', 'test_2'], description: 'test', from: 2, to: 3 },
    ];

    events.forEach(event =>
      timeline.add(event.type, event.labels, event.description, event.from, event.to)
    );
  });

  test('removes an event from all events', () => {
    timeline.remove(timeline.get()[0].id);

    expect(timeline.get()).toHaveLength(1);
    expect(timeline.get()[0].type).toBe('test_2');
  });

  test('removes an event from events by type', () => {
    timeline.remove(timeline.getByType('test_1')[0].id);

    expect(timeline.getByType('test_1')).toHaveLength(0);
  });

  test('removes an event from events by label', () => {
    timeline.remove(timeline.getByLabel('test_1')[0].id);

    expect(timeline.getByLabel('test_1')).toHaveLength(1);
    expect(timeline.getByLabel('test_1')[0].type).toBe('test_2');
  });
});

describe('getting events', () => {
  let timeline = null;

  beforeEach(() => {
    timeline = new Timeline();

    const events = [
      { type: 'test_1', labels: ['test_1'], description: 'test', from: 1, to: 2 },
      { type: 'test_2', labels: ['test_1', 'test_2'], description: 'test', from: 2, to: 3 },
      { type: 'test_2', labels: ['test_2'], description: 'test', from: 3, to: 4 },
    ];

    events.forEach(event =>
      timeline.add(event.type, event.labels, event.description, event.from, event.to)
    );
  });

  test('gets all events', () => {
    expect(timeline.get()).toHaveLength(3);
  });

  test('gets all events since a timestamp', () => {
    expect(timeline.get({ since: 2 })).toHaveLength(2);
  });

  test('gets all events until a timestamp', () => {
    expect(timeline.get({ until: 2 })).toHaveLength(2);
  });

  test('gets all events between timestamps', () => {
    expect(timeline.get({ since: 2, until: 2 })).toHaveLength(1);
  });

  test('gets all events by type', () => {
    expect(timeline.getByType('test_2')).toHaveLength(2);
  });

  test('gets all events by label', () => {
    expect(timeline.getByLabel('test_1')).toHaveLength(2);
  });
});
