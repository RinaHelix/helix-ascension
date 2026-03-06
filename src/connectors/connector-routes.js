// connector-routes.js — API routes for the connector system
// Rina's bridge to everything outside Helix

const express = require('express');
const ConnectorRegistry = require('./registry');
const CrisisConnector = require('./crisis-connector');
const router = express.Router();

// Initialize registry and connect what we have
const registry = new ConnectorRegistry();
const crisis = new CrisisConnector();
registry.register(crisis);
crisis.connect();

// Registry status — what is connected, what is coming
router.get('/status', (req, res) => {
  res.json(registry.getStatus());
});

// What is available vs coming
router.get('/available', (req, res) => {
  res.json(registry.getAvailability());
});

// Rina asks the registry for info
router.post('/query', async (req, res) => {
  const { intent, params } = req.body;
  if (!intent) return res.status(400).json({ error: 'What are you looking for?' });
  const result = await registry.query(intent, params || {});
  console.log(`[CONNECTORS] Query: "${intent}" → ${result.status} (${result.category})`);
  res.json(result);
});

// Direct crisis resource lookup
router.post('/crisis', async (req, res) => {
  const { situation } = req.body;
  const result = await crisis.fetch({ situation: situation || '' });
  console.log(`[CRISIS] Resource lookup — matched ${result.resources ? result.resources.length : 1} resources`);
  res.json(result);
});

module.exports = router;
