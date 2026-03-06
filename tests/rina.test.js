const { describe, it } = require('node:test');
const assert = require('node:assert');
const RinaEngine = require('../src/rina/rina-engine');

describe('Rina — Soul', () => {
  it('should load with soul document', () => {
    const rina = new RinaEngine();
    assert.ok(rina.soulLoaded, 'RINA-SOUL.md should be loaded');
  });

  it('should have first words ready', () => {
    const rina = new RinaEngine();
    const words = rina.getFirstWords();
    assert.ok(words.includes('second opinion'));
    assert.ok(words.includes('won\'t pretend'));
    assert.ok(words.includes('Where are you right now'));
  });

  it('should never sound corporate', () => {
    const rina = new RinaEngine();
    const words = rina.getFirstWords();
    assert.ok(!words.includes('How can I help you today'));
    assert.ok(!words.includes('Welcome to'));
    assert.ok(!words.includes('Get started'));
  });
});

describe('Rina — Prompts', () => {
  it('should build prompts with the full soul', () => {
    const rina = new RinaEngine();
    const prompt = rina.buildPrompt('What is money?', {
      language: 'en',
      literacyLevel: 'beginner',
      profession: 'cook'
    });
    assert.ok(prompt.system.includes('second opinion'));
    assert.ok(prompt.system.includes('Global dominance creates a cycle'));
    assert.ok(prompt.system.includes('NEVER diagnose'));
    assert.ok(prompt.system.includes('cook'));
    assert.strictEqual(prompt.user, 'What is money?');
  });

  it('should work without user context', () => {
    const rina = new RinaEngine();
    const prompt = rina.buildPrompt('Hello');
    assert.ok(prompt.system.length > 100);
    assert.strictEqual(prompt.user, 'Hello');
  });

  it('should include pattern recognition in system prompt', () => {
    const rina = new RinaEngine();
    const prompt = rina.buildPrompt('test');
    assert.ok(prompt.system.includes('construction worker in 1940'));
    assert.ok(prompt.system.includes('gig worker in 2026'));
    assert.ok(prompt.system.includes('cycle'));
  });
});

describe('Rina — Content Themes', () => {
  it('should have five themes', () => {
    const rina = new RinaEngine();
    assert.strictEqual(Object.keys(rina.themes).length, 5);
  });

  it('should return a valid daily theme', () => {
    const rina = new RinaEngine();
    const theme = rina.getTodayTheme();
    assert.ok(theme.key);
    assert.ok(theme.description);
    assert.ok(['the_system', 'the_human', 'the_tech', 'the_mirror', 'the_build'].includes(theme.key));
  });

  it('the_mirror should reflect real patterns not fluff', () => {
    const rina = new RinaEngine();
    assert.ok(rina.themes.the_mirror.includes('broken'));
    assert.ok(rina.themes.the_mirror.includes('pattern'));
  });
});

describe('Rina — Offline Mode', () => {
  it('should return offline status without API key', async () => {
    const oldKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const rina = new RinaEngine();
    const result = await rina.respond('Hello');
    assert.strictEqual(result.status, 'offline');
    assert.ok(result.firstWords.includes('second opinion'));
    assert.ok(result.preview);

    if (oldKey) process.env.ANTHROPIC_API_KEY = oldKey;
  });
});
