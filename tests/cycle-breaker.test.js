const { describe, it } = require('node:test');
const assert = require('node:assert');
const CycleBreaker = require('../src/modules/cycle-breaker');

describe('Cycle Breaker', () => {
  it('should have 6 cycles mapped', () => {
    const cb = new CycleBreaker();
    const cycles = cb.listCycles();
    assert.strictEqual(cycles.length, 6);
  });

  it('should identify work-life trap from exhaustion keywords', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('I am tired and have no energy from work');
    assert.ok(result.patterns.length > 0);
    assert.strictEqual(result.patterns[0].cycleId, 'work_life_trap');
  });

  it('should identify generational settling', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('Nobody in my family ever had a chance to do anything');
    assert.ok(result.patterns.some(p => p.cycleId === 'generational_settling'));
  });

  it('should identify veteran-related absent parent cycle', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('I grew up without a father');
    assert.ok(result.patterns.some(p => p.cycleId === 'absent_parent_cycle'));
  });

  it('should identify comparison trap from social media', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('Everyone on social media seems more successful than me');
    assert.ok(result.patterns.some(p => p.cycleId === 'comparison_trap'));
  });

  it('should identify system distrust', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('I dont trust banks they have burned me before');
    assert.ok(result.patterns.some(p => p.cycleId === 'system_distrust'));
  });

  it('should identify information desert', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('I have no access to technology and feel left behind');
    assert.ok(result.patterns.some(p => p.cycleId === 'information_desert'));
  });

  it('should return doors for each cycle', () => {
    const cb = new CycleBreaker();
    const cycles = cb.listCycles();
    for (const cycle of cycles) {
      const doors = cb.getDoors(cycle.id);
      assert.ok(doors, `Doors missing for ${cycle.id}`);
      assert.ok(doors.doors.length > 0, `No doors for ${cycle.id}`);
      assert.ok(doors.reminder.includes('You choose'));
    }
  });

  it('should always include disclaimer', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('anything');
    assert.ok(result.disclaimer.includes('not diagnosis'));
  });

  it('should listen when no patterns match', () => {
    const cb = new CycleBreaker();
    const result = cb.identifyPatterns('hello');
    assert.ok(result.note.includes('Tell me more'));
  });
});
