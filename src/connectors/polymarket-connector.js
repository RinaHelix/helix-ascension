const ConnectorBase = require('./connector-base');

class PolymarketConnector extends ConnectorBase {
  constructor() {
    super('Polymarket Intelligence', { type: 'prediction-markets' });
    this.markets = [];
    this.maxMarkets = 100;
  }

  // Ingest market data
  addMarket(data) {
    const market = {
      id: data.id || `poly-${Date.now()}`,
      timestamp: new Date().toISOString(),
      question: data.question || data.title || 'Unknown',
      probability: parseFloat(data.probability || data.prob || 0),
      volume: data.volume || '$0',
      liquidity: data.liquidity || 'unknown',
      endDate: data.endDate || data.end_date || null,
      category: this.categorize(data.question || ''),
      helixAnalysis: null
    };
    
    this.markets.unshift(market);
    if (this.markets.length > this.maxMarkets) this.markets = this.markets.slice(0, this.maxMarkets);
    return market;
  }

  categorize(question) {
    const lower = question.toLowerCase();
    if (/fed|rate|inflation|treasury/.test(lower)) return 'macro';
    if (/bitcoin|btc|crypto|eth|token/.test(lower)) return 'crypto';
    if (/election|president|congress|vote/.test(lower)) return 'politics';
    if (/ai|regulation|tech|model/.test(lower)) return 'technology';
    if (/war|conflict|military/.test(lower)) return 'geopolitical';
    if (/nfl|nba|mlb|game|championship/.test(lower)) return 'sports';
    return 'other';
  }

  // Helix analysis layer
  analyzeMarket(market, newsConnector, cryptoConnector) {
    const analysis = {
      marketProb: market.probability,
      helixConfidence: null,
      edge: null,
      verdict: null,
      dataPoints: [],
      transparent: true
    };

    // Check news sentiment for related topics
    if (newsConnector) {
      const relatedNews = newsConnector.getByCategory(market.category, 5);
      if (relatedNews.length > 0) {
        const avgSentiment = relatedNews.reduce((sum, a) => sum + a.sentiment.score, 0) / relatedNews.length;
        analysis.dataPoints.push({
          source: 'News Sentiment',
          value: avgSentiment.toFixed(2),
          direction: avgSentiment > 0 ? 'supports YES' : 'supports NO'
        });
      }
    }

    // Check crypto data for crypto markets
    if (cryptoConnector && market.category === 'crypto') {
      analysis.dataPoints.push({
        source: 'Crypto Market Data',
        value: 'CoinGecko real-time',
        direction: 'live feed active'
      });
    }

    // Simple edge detection
    if (analysis.dataPoints.length > 0) {
      const yesSignals = analysis.dataPoints.filter(d => d.direction.includes('YES')).length;
      const noSignals = analysis.dataPoints.filter(d => d.direction.includes('NO')).length;
      
      if (yesSignals > noSignals && market.probability < 70) {
        analysis.edge = 'potential underpricing';
        analysis.verdict = 'Data suggests market may be underpricing YES';
      } else if (noSignals > yesSignals && market.probability > 60) {
        analysis.edge = 'potential overpricing';
        analysis.verdict = 'Data suggests market may be overpricing YES';
      } else {
        analysis.edge = 'none detected';
        analysis.verdict = 'Market price appears efficient based on available data';
      }
    } else {
      analysis.verdict = 'Insufficient data for Helix analysis — monitoring';
    }

    // Celebrity/meme filter
    const lower = market.question.toLowerCase();
    if (/kanye|kardashian|meme|celebrity|influencer/.test(lower)) {
      analysis.verdict = 'RINA WARNING: Celebrity/meme market. High volume ≠ high value. Noise disguised as signal.';
      analysis.edge = 'skip recommended';
    }

    analysis.disclaimer = 'CRITICAL Rule 9: Paper trading only. Pattern recognition, not prophecy.';
    market.helixAnalysis = analysis;
    return analysis;
  }

  getMarkets(limit = 20) { return this.markets.slice(0, limit); }
  
  getByCategory(category, limit = 10) {
    return this.markets.filter(m => m.category === category).slice(0, limit);
  } — ${msg}`); }
}

module.exports = PolymarketConnector;
