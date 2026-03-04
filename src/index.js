// Helix Ascension — Main Entry Point
// "Infrastructure for human life"

const express = require('express');
const Governor = require('./governor/governor');
const { loadCriticalRules } = require('./governor/critical-loader');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load governance rules at startup — non-negotiable
const criticalRules = loadCriticalRules();
console.log(`[HELIX] CRITICAL.md loaded: ${criticalRules.length} rules active`);

// Initialize Governor
const governor = new Governor(criticalRules);
console.log(`[HELIX] Governor initialized — dry_run: ${governor.dryRun}, kill_switch: ${governor.killSwitch}`);

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Helix Ascension',
    status: 'operational',
    governor: {
      active: true,
      dryRun: governor.dryRun,
      killSwitch: governor.killSwitch,
      registeredBots: governor.listBots(),
      rulesLoaded: criticalRules.length
    },
    message: 'Built for the forgotten.'
  });
});

// Governor status endpoint
app.get('/governor/status', (req, res) => {
  res.json(governor.getStatus());
});

// Governor action log
app.get('/governor/log', (req, res) => {
  res.json(governor.getLog());
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[HELIX] Ascension running on port ${PORT}`);
    console.log(`[HELIX] One commit at a time. That is how you change the world.`);
  });
}

module.exports = app;
