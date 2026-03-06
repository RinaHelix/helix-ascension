// content-routes.js — API routes for Rina's content engine
// Five themes. Daily rotation. Social voice for Helix.

const express = require('express');
const ContentEngine = require('./content-engine');
const router = express.Router();
const engine = new ContentEngine();

// Get today's theme
router.get('/today', (req, res) => {
  res.json(engine.getToday());
});

// Preview all five themes (no API needed)
router.get('/preview', (req, res) => {
  res.json(engine.previewAll());
});

// Get the weekly schedule
router.get('/schedule', (req, res) => {
  res.json(engine.getSchedule());
});

// Generate content for today (requires API)
router.post('/generate', async (req, res) => {
  const result = await engine.generateToday();
  console.log(`[CONTENT] Generated ${result.theme} — status: ${result.status}`);
  res.json(result);
});

// Generate content for a specific theme (requires API)
router.post('/generate/:theme', async (req, res) => {
  const result = await engine.generate(req.params.theme);
  console.log(`[CONTENT] Generated ${req.params.theme} — status: ${result.status}`);
  res.json(result);
});

module.exports = router;
