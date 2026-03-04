const { describe, it } = require('node:test');
const assert = require('node:assert');
const Governor = require('../src/governor/governor');
const { loadCriticalRules, validateAction } = require('../src/governor/critical-loader');

describe('CRITICAL.md Loader', () => {
  it('should load governance rules from CRITICAL.md', () => {
    const rules = loadCriticalRules();
    assert.ok(rules.length >= 10, `Expected 10+ rules, got ${rules.length}`);
  });

  it('should include the human-approval rule', () => {
    const rules = loadCriticalRules();
    const rule1 = rules.find(r => r.id === 1);
    assert.ok(rule1, 'Rule 1 must exist');
    assert.ok(rule1.title.toLowerCase().includes('irreversible'));
  });

  it('should include paper trading rule', () => {
    const rules = loadCriticalRules();
    const rule9 = rules.find(r => r.id === 9);
    assert.ok(rule9, 'Rule 9 must exist');
    assert.ok(rule9.title.toLowerCase().includes('trading'));
  });
});

describe('Governor — Registration', () => {
  it('should register a bot with a declared job', () => {
    const gov = new Governor([]);
    const result = gov.register('test-bot', { job: 'testing', allowedActions: ['test'] });
    assert.strictEqual(result, true);
  });

  it('should reject duplicate bot registration', () => {
    const gov = new Governor([]);
    gov.register('test-bot', { job: 'testing', allowedActions: ['test'] });
    assert.throws(() => {
      gov.register('test-bot', { job: 'testing-again', allowedActions: ['test'] });
    }, /already registered/);
  });

  it('should reject bot without a declared job', () => {
    const gov = new Governor([]);
    assert.throws(() => {
      gov.register('no-job-bot', { allowedActions: ['test'] });
    }, /must declare its single job/);
  });
});

describe('Governor — CRITICAL Rule 1: Human Approval', () => {
  it('should block irreversible actions without human approval', async () => {
    const gov = new Governor([]);
    gov.register('trade-bot', {
      job: 'trading',
      allowedActions: ['trade'],
      trade: async () => ({ executed: true })
    });
    const result = await gov.execute('trade-bot', 'trade', { ticker: 'AAPL' }, false);
    assert.strictEqual(result.status, 'pending');
    assert.ok(result.reason.includes('human approval'));
  });

  it('should allow irreversible actions WITH human approval', async () => {
    process.env.GOVERNOR_DRY_RUN = 'false';
    const gov = new Governor([]);
    gov.register('post-bot', {
      job: 'posting',
      allowedActions: ['post'],
      post: async (params) => ({ posted: true, content: params.content })
    });
    const result = await gov.execute('post-bot', 'post', { content: 'test' }, true);
    assert.strictEqual(result.status, 'success');
    process.env.GOVERNOR_DRY_RUN = 'true';
  });
});

describe('Governor — CRITICAL Rule 2: One Bot One Job', () => {
  it('should block actions outside bot scope', async () => {
    const gov = new Governor([]);
    gov.register('analyzer', {
      job: 'analysis',
      allowedActions: ['analyze'],
      analyze: async () => ({ data: true })
    });
    const result = await gov.execute('analyzer', 'trade', {});
    assert.strictEqual(result.status, 'blocked');
    assert.ok(result.reason.includes('outside bot scope'));
  });
});

describe('Governor — CRITICAL Rule 4: Kill Switch', () => {
  it('should block all actions when kill switch is active', async () => {
    const gov = new Governor([]);
    gov.register('any-bot', {
      job: 'anything',
      allowedActions: ['doSomething'],
      doSomething: async () => ({ done: true })
    });
    gov.activateKillSwitch('emergency test');
    const result = await gov.execute('any-bot', 'doSomething', {}, true);
    assert.strictEqual(result.status, 'blocked');
    assert.ok(result.reason.includes('Kill switch'));
  });

  it('should require human approval to deactivate kill switch', () => {
    const gov = new Governor([]);
    gov.activateKillSwitch('test');
    const result = gov.deactivateKillSwitch(false);
    assert.strictEqual(result.status, 'denied');
    const approved = gov.deactivateKillSwitch(true);
    assert.strictEqual(approved.status, 'active');
  });
});

describe('Governor — CRITICAL Rule 5: Dry Run', () => {
  it('should default to dry-run mode', async () => {
    process.env.GOVERNOR_DRY_RUN = 'true';
    const gov = new Governor([]);
    gov.register('safe-bot', {
      job: 'safe-work',
      allowedActions: ['analyze'],
      analyze: async () => ({ data: true })
    });
    const result = await gov.execute('safe-bot', 'analyze', { ticker: 'AAPL' });
    assert.strictEqual(result.status, 'dry_run');
  });
});

describe('Governor — CRITICAL Rule 3: Logging', () => {
  it('should log every action', async () => {
    const gov = new Governor([]);
    gov.register('log-bot', {
      job: 'logging-test',
      allowedActions: ['analyze'],
      analyze: async () => ({ ok: true })
    });
    await gov.execute('log-bot', 'analyze', { test: true });
    const log = gov.getLog();
    assert.ok(log.length >= 2);
    const lastEntry = log[log.length - 1];
    assert.ok(lastEntry.timestamp);
    assert.ok(lastEntry.bot);
    assert.ok(lastEntry.type);
  });
});

describe('Action Validation', () => {
  it('should reject trades not in paper mode', () => {
    const result = validateAction({ type: 'trade', paperMode: false }, []);
    assert.strictEqual(result.valid, false);
    assert.ok(result.violations.some(v => v.rule === 9));
  });

  it('should accept paper trades', () => {
    const result = validateAction({ type: 'trade', paperMode: true }, []);
    assert.strictEqual(result.valid, true);
  });
});
