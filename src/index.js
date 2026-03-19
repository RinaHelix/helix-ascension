// Helix Ascension — Main Entry Point
// "Infrastructure for humanity"
// "Global dominance creates a cycle. Global unity creates a better world."

const express = require('express');
const Governor = require('./governor/governor');
const { loadCriticalRules } = require('./governor/critical-loader');
const rinaRoutes = require('./rina/rina-routes');
const contentRoutes = require('./rina/content-routes');
const cycleRoutes = require('./modules/cycle-routes');
const connectorRoutes = require('./connectors/connector-routes');
const frequencyRoutes = require('./modules/frequency-routes');
const marketRoutes = require('./connectors/market-routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Load governance rules at startup — non-negotiable
const criticalRules = loadCriticalRules();
console.log(`[HELIX] CRITICAL.md loaded: ${criticalRules.length} rules active`);

// Initialize Governor
const governor = new Governor(criticalRules);
console.log(`[HELIX] Governor initialized — dry_run: ${governor.dryRun}, kill_switch: ${governor.killSwitch}`);

// Check Rina soul
const fs = require('fs');
const soulPath = require('path').join(__dirname, '..', 'docs', 'RINA-SOUL.md');
if (fs.existsSync(soulPath)) {
  console.log('[HELIX] RINA-SOUL.md loaded. She knows who she is.');
} else {
  console.log('[HELIX] Warning: RINA-SOUL.md not found.');
}

// Health check
app.get('/api', (req, res) => {
  res.json({
    name: 'Helix Ascension',
    mission: 'Infrastructure for humanity. Built for the forgotten.',
    truth: 'Global dominance creates a cycle. Global unity creates a better world.',
    status: 'operational',
    governor: {
      active: true,
      dryRun: governor.dryRun,
      killSwitch: governor.killSwitch,
      registeredBots: governor.listBots(),
      rulesLoaded: criticalRules.length
    }
  });
});

// Rina endpoints
app.use('/rina', rinaRoutes);
app.use('/content', contentRoutes);
app.use('/cycles', cycleRoutes);
app.use('/connect', connectorRoutes);
app.use('/frequency', frequencyRoutes);
app.use('/markets', marketRoutes);

// Governor endpoints
app.get('/governor/status', (req, res) => {
  res.json(governor.getStatus());
});

app.get('/governor/log', (req, res) => {
  res.json(governor.getLog());
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[HELIX] Ascension running on port ${PORT}`);
    console.log(`[HELIX] One commit at a time.`);
  });
}

module.exports = app;
