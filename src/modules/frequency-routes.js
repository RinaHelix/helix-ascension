const express = require('express');
const FrequencyGames = require('./frequency-games');
const router = express.Router();
const freq = new FrequencyGames();

router.get('/all', (req, res) => res.json(freq.listAll()));

router.get('/:id', (req, res) => {
  const f = freq.getFrequency(req.params.id);
  if (!f) return res.status(404).json({ error: 'Frequency not found.' });
  res.json(f);
});

router.get('/:freqId/game/:gameId', (req, res) => {
  const g = freq.getGame(req.params.freqId, req.params.gameId);
  if (!g) return res.status(404).json({ error: 'Game not found.' });
  res.json(g);
});

router.post('/recommend', (req, res) => {
  const { situation } = req.body;
  if (!situation) return res.status(400).json({ error: 'Tell me how you feel.' });
  res.json(freq.recommend(situation));
});

module.exports = router;
