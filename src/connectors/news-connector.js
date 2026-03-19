const ConnectorBase = require('./connector-base');

class NewsConnector extends ConnectorBase {
  constructor() {
    super('News Intelligence', { type: 'information' });
    this.articles = [];
    this.maxArticles = 200;
    this.sources = [];
  }

  // Receive news from webhook or manual feed
  ingestArticle(data) {
    const article = {
      id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      title: data.title || 'Untitled',
      source: data.source || 'Unknown',
      url: data.url || null,
      summary: data.summary || data.description || null,
      category: this.categorize(data.title + ' ' + (data.summary || '')),
      sentiment: this.analyzeSentiment(data.title + ' ' + (data.summary || '')),
      tickers: this.extractTickers(data.title + ' ' + (data.summary || '')),
      relevance: data.relevance || 'general'
    };

    this.articles.unshift(article);
    if (this.articles.length > this.maxArticles) this.articles = this.articles.slice(0, this.maxArticles);
    return article;
  }

  // Batch ingest from API response
  ingestBatch(articles) {
    return articles.map(a => this.ingestArticle(a));
  }

  categorize(text) {
    const lower = text.toLowerCase();
    if (/fed|rate|inflation|treasury|bond|monetary/.test(lower)) return 'macro';
    if (/crypto|bitcoin|ethereum|blockchain|token/.test(lower)) return 'crypto';
    if (/earnings|revenue|profit|quarterly/.test(lower)) return 'earnings';
    if (/ai|artificial|model|agent|llm|neural/.test(lower)) return 'ai';
    if (/regulation|sec|congress|bill|law|compliance/.test(lower)) return 'regulation';
    if (/war|conflict|sanctions|military|geopolitical/.test(lower)) return 'geopolitical';
    if (/veteran|va |disability|benefits|claim/.test(lower)) return 'veteran';
    if (/worker|labor|union|wage|employment|jobs/.test(lower)) return 'labor';
    return 'general';
  }

  analyzeSentiment(text) {
    const lower = text.toLowerCase();
    const positive = ['surge', 'rally', 'growth', 'record', 'breakthrough', 'approval', 'gain', 'bullish', 'strong', 'boom'];
    const negative = ['crash', 'decline', 'loss', 'fear', 'collapse', 'warning', 'bearish', 'weak', 'crisis', 'plunge', 'fraud'];
    
    const posCount = positive.filter(w => lower.includes(w)).length;
    const negCount = negative.filter(w => lower.includes(w)).length;
    
    if (posCount > negCount + 1) return { score: 0.7, label: 'positive' };
    if (negCount > posCount + 1) return { score: -0.7, label: 'negative' };
    if (posCount > negCount) return { score: 0.3, label: 'slightly-positive' };
    if (negCount > posCount) return { score: -0.3, label: 'slightly-negative' };
    return { score: 0, label: 'neutral' };
  }

  extractTickers(text) {
    const tickers = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC', 'ETH', 'SOL', 'SPY', 'QQQ', 'DOGE'];
    return tickers.filter(t => text.toUpperCase().includes(t));
  }

  getLatest(limit = 20) { return this.articles.slice(0, limit); }

  getByCategory(category, limit = 10) {
    return this.articles.filter(a => a.category === category).slice(0, limit);
  }

  getByTicker(ticker, limit = 10) {
    return this.articles.filter(a => a.tickers.includes(ticker.toUpperCase())).slice(0, limit);
  }

  getSentimentOverview() {
    const recent = this.articles.slice(0, 50);
    if (recent.length === 0) return { overall: 'no data', breakdown: {} };
    
    const avg = recent.reduce((sum, a) => sum + a.sentiment.score, 0) / recent.length;
    const categories = {};
    for (const a of recent) {
      if (!categories[a.category]) categories[a.category] = { count: 0, sentiment: 0 };
      categories[a.category].count++;
      categories[a.category].sentiment += a.sentiment.score;
    }
    for (const cat of Object.values(categories)) cat.sentiment = (cat.sentiment / cat.count).toFixed(2);

    return {
      overall: avg > 0.2 ? 'positive' : avg < -0.2 ? 'negative' : 'neutral',
      score: avg.toFixed(2),
      articleCount: recent.length,
      categories,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = NewsConnector;
