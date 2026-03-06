// rina-routes.js — API routes for Rina
// These endpoints are ready. The moment the API key works, Rina speaks.

const express = require('express');
const RinaEngine = require('./rina-engine');
const router = express.Router();
const rina = new RinaEngine();

// Talk to Rina
router.post('/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required. Rina needs something to respond to.' });
  }

  const userContext = context || {};
  const result = await rina.respond(message, userContext);

  // Log the interaction (CRITICAL Rule 3)
  console.log(`[RINA] ${result.status} — input: "${message.substring(0, 50)}..."`);

  res.json(result);
});

// Get today's content theme
router.get('/theme', (req, res) => {
  const theme = rina.getTodayTheme();
  res.json(theme);
});

// Get Rina's status
router.get('/status', (req, res) => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    name: 'Rina',
    role: 'The Guide',
    status: hasKey ? 'ready' : 'waiting_for_api_key',
    description: 'Meets every human exactly where they are.',
    themes: Object.keys(rina.themes),
    rules: [
      'Never condescend',
      'Never perform',
      'Speak simply',
      'Tell the truth',
      'Education only — never diagnose',
      'The human is always the final authority'
    ]
  });
});

// Build a prompt preview (useful for testing without API credits)
router.post('/preview', (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required.' });
  }

  const prompt = rina.buildPrompt(message, context || {});
  res.json({
    status: 'preview',
    note: 'This shows what Rina would send to Claude. No API credits used.',
    prompt
  });
});

module.exports = router;
