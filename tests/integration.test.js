const { describe, it } = require('node:test');
const assert = require('node:assert');
const Governor = require('../src/governor/governor');
const { loadCriticalRules } = require('../src/governor/critical-loader');
const tradingBot = require('../src/bots/trading-bot');
const RinaEngine = require('../src/rina/rina-engine');
const FinancialLiteracyModule = require('../src/modules/financial-literacy');

describe('Full System Integration', () => {
  it('should boot with CRITICAL rules and register trading bot', async () => {
    const rules = loadCriticalRules();
    const gov = new Governor(rules);
    gov.register('trading', tradingBot);
    const status = gov.getStatus();
    assert.ok(status.rulesActive >= 10);
    assert.strictEqual(status.registeredBots.length, 1);
    assert.strictEqual(status.registeredBots[0].job, 'paper-trade-analysis');
  });

  it('should enforce human approval for trade actions through Governor', async () => {
    const gov = new Governor(loadCriticalRules());
    gov.register('trading', tradingBot);
    const result = await gov.execute('trading', 'simulateTrade', {
      ticker: 'AAPL', side: 'buy', quantity: 10, price: 180
    }, false);
    assert.strictEqual(result.status, 'pending');
    assert.ok(result.reason.includes('human approval'));
  });

  it('should block trading bot from posting (one bot one job)', async () => {
    const gov = new Governor(loadCriticalRules());
    gov.register('trading', tradingBot);
    const result = await gov.execute('trading', 'post', { content: 'test' });
    assert.strictEqual(result.status, 'blocked');
  });

  it('should analyze a ticker through Governor safely', async () => {
    process.env.GOVERNOR_DRY_RUN = 'false';
    const gov = new Governor(loadCriticalRules());
    gov.register('trading', tradingBot);
    const result = await gov.execute('trading', 'analyze', { ticker: 'AAPL' });
    assert.strictEqual(result.status, 'success');
    assert.strictEqual(result.result.ticker, 'AAPL');
    process.env.GOVERNOR_DRY_RUN = 'true';
  });
});

describe('Rina Engine', () => {
  it('should build prompts with user context', () => {
    const rina = new RinaEngine();
    const prompt = rina.buildPrompt('What is a stock?', {
      language: 'en', literacyLevel: 'beginner', profession: 'cook'
    });
    assert.ok(prompt.system.includes('Rina'));
    assert.ok(prompt.system.includes('cook'));
    assert.strictEqual(prompt.user, 'What is a stock?');
  });

  it('should rotate daily content themes', () => {
    const rina = new RinaEngine();
    const theme = rina.getTodayTheme();
    assert.ok(theme.key);
    assert.ok(theme.description);
    assert.ok(['the_system', 'the_human', 'the_tech', 'the_mirror', 'the_build'].includes(theme.key));
  });

  it('should return pending status without API key', async () => {
    const rina = new RinaEngine();
    const result = await rina.respond('Hello');
    assert.strictEqual(result.status, 'pending_api');
  });
});

describe('Financial Literacy Module', () => {
  it('should have all five levels', () => {
    const mod = new FinancialLiteracyModule();
    const overview = mod.getOverview();
    assert.strictEqual(overview.length, 5);
  });

  it('should start everyone at Level 1 — no assumptions', () => {
    const mod = new FinancialLiteracyModule();
    const assessment = mod.assessLevel({ profession: 'banker' });
    assert.strictEqual(assessment.recommended, 'level_1');
  });

  it('should find a specific lesson', () => {
    const mod = new FinancialLiteracyModule();
    const lesson = mod.getLesson('L1-01');
    assert.ok(lesson);
    assert.ok(lesson.title.includes('money'));
  });

  it('should include disclaimer on every interaction', () => {
    const mod = new FinancialLiteracyModule();
    const assessment = mod.assessLevel();
    assert.ok(assessment.disclaimer.includes('not financial advice'));
    const lesson = mod.getLesson('L1-01');
    assert.ok(lesson.disclaimer.includes('not financial advice'));
  });

  it('should return null for non-existent lessons', () => {
    const mod = new FinancialLiteracyModule();
    const lesson = mod.getLesson('FAKE-99');
    assert.strictEqual(lesson, null);
  });
});
