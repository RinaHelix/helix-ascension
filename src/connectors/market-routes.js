const express = require('express');
const router = express.Router();
const TradingViewConnector = require('./tradingview-connector');
const CryptoConnector = require('./crypto-connector');
const NewsConnector = require('./news-connector');
const PolymarketConnector = require('./polymarket-connector');
const SocialConnector = require('./social-connector');

// Initialize all connectors
const tv = new TradingViewConnector();
const crypto = new CryptoConnector();
const news = new NewsConnector();
const poly = new PolymarketConnector();
const social = new SocialConnector();

// === TRADINGVIEW ===
router.post('/tradingview/webhook', (req, res) => {
  const signal = tv.processWebhook(req.body);
  res.json({ received: true, signal });
});
router.get('/tradingview/signals', (req, res) => res.json(tv.getSignals(parseInt(req.query.limit) || 20)));
router.get('/tradingview/signals/:ticker', (req, res) => res.json(tv.getTickerSignals(req.params.ticker)));
router.get('/tradingview/summary', (req, res) => res.json(tv.getSummary()));

// === CRYPTO ===
router.get('/crypto/prices', async (req, res) => {
  try {
    const data = await crypto.fetchPrices();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/crypto/trending', async (req, res) => {
  try {
    const data = await crypto.fetchTrending();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/crypto/overview', async (req, res) => {
  try {
    const data = await crypto.getMarketOverview();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === NEWS ===
router.post('/news/ingest', (req, res) => {
  const article = news.ingestArticle(req.body);
  res.json({ received: true, article });
});
router.post('/news/batch', (req, res) => {
  const articles = news.ingestBatch(req.body.articles || []);
  res.json({ received: articles.length, articles });
});
router.get('/news/latest', (req, res) => res.json(news.getLatest(parseInt(req.query.limit) || 20)));
router.get('/news/category/:category', (req, res) => res.json(news.getByCategory(req.params.category)));
router.get('/news/ticker/:ticker', (req, res) => res.json(news.getByTicker(req.params.ticker)));
router.get('/news/sentiment', (req, res) => res.json(news.getSentimentOverview()));

// === POLYMARKET ===
router.post('/polymarket/market', (req, res) => {
  const market = poly.addMarket(req.body);
  const analysis = poly.analyzeMarket(market, news, crypto);
  res.json({ market, analysis });
});
router.get('/polymarket/markets', (req, res) => res.json(poly.getMarkets(parseInt(req.query.limit) || 20)));
router.get('/polymarket/category/:category', (req, res) => res.json(poly.getByCategory(req.params.category)));

// === SOCIAL INTELLIGENCE ===
router.post('/social/signal', (req, res) => {
  const signal = social.addSignal(req.body);
  res.json({ received: true, signal });
});
router.post('/social/batch', (req, res) => {
  const signals = (req.body.signals || []).map(s => social.addSignal(s));
  res.json({ received: signals.length });
});
router.get('/social/signals', (req, res) => res.json(social.getSignals(parseInt(req.query.limit) || 20)));
router.get('/social/category/:category', (req, res) => res.json(social.getByCategory(req.params.category)));
router.get('/social/pain-points', (req, res) => res.json(social.getPainPointSummary()));
router.get('/social/trending', (req, res) => res.json(social.getTrendingTopics()));
router.get('/social/opportunities', (req, res) => res.json(social.getOpportunities()));

// === UNIFIED INTELLIGENCE ===
router.get('/intelligence/overview', async (req, res) => {
  try {
    const [cryptoData, tvSummary, sentiment, painPoints, trending] = await Promise.all([
      crypto.getMarketOverview(),
      tv.getSummary(),
      news.getSentimentOverview(),
      social.getPainPointSummary(),
      social.getTrendingTopics()
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      crypto: cryptoData,
      tradingview: tvSummary,
      newsSentiment: sentiment,
      socialPainPoints: painPoints,
      trendingTopics: trending,
      polymarkets: poly.getMarkets(5),
      governor: 'All data passes through CRITICAL.md. Paper mode enforced. Human is final authority.',
      transparencyNote: 'Every data point in this response has a verifiable source. Tap any item for the full trace.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
