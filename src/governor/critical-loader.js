// critical-loader.js — Loads CRITICAL.md governance rules at startup
// These rules are non-negotiable. They load before anything else.

const fs = require('fs');
const path = require('path');

function loadCriticalRules() {
  const criticalPath = path.join(__dirname, '..', '..', 'CRITICAL.md');

  if (!fs.existsSync(criticalPath)) {
    console.error('[CRITICAL] FATAL: CRITICAL.md not found. System cannot start without governance.');
    process.exit(1);
  }

  const content = fs.readFileSync(criticalPath, 'utf-8');
  const rules = [];

  const rulePattern = /^\d+\.\s+\*\*(.+?)\*\*\s*(.*)$/gm;
  let match;

  while ((match = rulePattern.exec(content)) !== null) {
    rules.push({
      id: rules.length + 1,
      title: match[1].trim(),
      description: match[2].trim(),
      enforced: true
    });
  }

  if (rules.length === 0) {
    console.error('[CRITICAL] FATAL: No rules parsed from CRITICAL.md. File may be malformed.');
    process.exit(1);
  }

  console.log(`[CRITICAL] Loaded ${rules.length} governance rules:`);
  rules.forEach(r => console.log(`  Rule ${r.id}: ${r.title}`));

  return rules;
}

function validateAction(action, rules) {
  const violations = [];

  if (action.irreversible && !action.humanApproved) {
    violations.push({ rule: 1, message: 'Irreversible action without human approval' });
  }
  if (action.requiresDryRun && !action.dryRunCompleted) {
    violations.push({ rule: 5, message: 'Action requires dry-run completion first' });
  }
  if (action.type === 'trade' && !action.paperMode) {
    violations.push({ rule: 9, message: 'Trading must be paper mode by default' });
  }

  return { valid: violations.length === 0, violations };
}

module.exports = { loadCriticalRules, validateAction };
