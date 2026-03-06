// cycle-routes.js — API routes for the Cycle Breaker
// Names the pattern. Shows the door. Never diagnoses.

const express = require('express');
const CycleBreaker = require('./cycle-breaker');
const router = express.Router();
const breaker = new CycleBreaker();

// List all cycles
router.get('/cycles', (req, res) => {
  res.json(breaker.listCycles());
});

// Get a specific cycle
router.get('/cycles/:id', (req, res) => {
  const cycle = breaker.getCycle(req.params.id);
  if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
  res.json(cycle);
});

// Get doors for a cycle
router.get('/cycles/:id/doors', (req, res) => {
  const doors = breaker.getDoors(req.params.id);
  if (!doors) return res.status(404).json({ error: 'Cycle not found.' });
  res.json(doors);
});

// Identify patterns from user input
router.post('/identify', (req, res) => {
  const { situation } = req.body;
  if (!situation) {
    return res.status(400).json({ error: 'Tell me your situation. I am listening.' });
  }
  const result = breaker.identifyPatterns(situation);
  console.log(`[CYCLES] Identified ${result.patterns.length} patterns`);
  res.json(result);
});

module.exports = router;
