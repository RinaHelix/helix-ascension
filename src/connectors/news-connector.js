const ConnectorBase = require('./connector-base');

class NewsConnector extends ConnectorBase {
  constructor() {
    super('News Intelligence', { type: 'information' });
    this.articles = [];
    this.maxArticles = 500;
    
    // Real news sources traders and everyday people use
    this.sources = {
      // Crypto news
      crypto: [
        { name: 'CoinDesk', url: 'https://www.coindesk.com', rss: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
        { name: 'CoinTelegraph', url: 'https://cointelegraph.com', rss: 'https://cointelegraph.com/rss' },
        { name: 'The Block', url: 'https://www.theblock.co' },
        { name: 'Decrypt', url: 'https://decrypt.co', rss: 'https://decrypt.co/feed' },
        { name: 'DeFi Llama', url: 'https://defillama.com' },
        { name: 'Messari', url: 'https://messari.io' },
        { name: 'CryptoSlate', url: 'https://cryptoslate.com', rss: 'https://cryptoslate.com/feed/' },
      ],
      // Traditional finance news
      finance: [
        { name: 'CNBC Markets', url: 'https://www.cnbc.com/markets/' },
        { name: 'Bloomberg', url: 'https://www.bloomberg.com/markets' },
        { name: 'Reuters Business', url: 'https://www.reuters.com/business/', rss: 'https://www.reutersagency.com/feed/' },
        { name: 'MarketWatch', url: 'https://www.marketwatch.com' },
        { name: 'Wall Street Journal', url: 'https://www.wsj.com/news/markets' },
        { name: 'Barrons', url: 'https://www.barrons.com' },
        { name: 'Seeking Alpha', url: 'https://seekingalpha.com' },
        { name: 'Benzinga', url: 'https://www.benzinga.com', rss: 'https://www.benzinga.com/feed' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
        { name: 'Investopedia', url: 'https://www.investopedia.com' },
        { name: 'Financial Times', url: 'https://www.ft.com' },
        { name: 'Motley Fool', url: 'https://www.fool.com' },
      ],
      // General news
      general: [
        { name: 'AP News', url: 'https://apnews.com', rss: 'https://apnews.com/index.rss' },
        { name: 'Reuters', url: 'https://www.reuters.com', rss: 'https://www.reutersagency.com/feed/' },
        { name: 'NPR', url: 'https://www.npr.org', rss: 'https://feeds.npr.org/1001/rss.xml' },
        { name: 'BBC World', url: 'https://www.bbc.com/news', rss: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com' },
        { name: 'The Guardian', url: 'https://www.theguardian.com', rss: 'https://www.theguardian.com/world/rss' },
        { name: 'CNN', url: 'https://www.cnn.com' },
        { name: 'NBC News', url: 'https://www.nbcnews.com' },
      ],
      // Tech & AI news
      tech: [
        { name: 'TechCrunch', url: 'https://techcrunch.com', rss: 'https://techcrunch.com/feed/' },
        { name: 'Ars Technica', url: 'https://arstechnica.com', rss: 'https://feeds.arstechnica.com/arstechnica/index' },
        { name: 'The Verge', url: 'https://www.theverge.com', rss: 'https://www.theverge.com/rss/index.xml' },
        { name: 'Wired', url: 'https://www.wired.com' },
        { name: 'MIT Technology Review', url: 'https://www.technologyreview.com' },
        { name: 'Hacker News', url: 'https://news.ycombinator.com' },
        { name: 'Product Hunt', url: 'https://www.producthunt.com' },
      ],
      // Government & policy
      government: [
        { name: 'Federal Register', url: 'https://www.federalregister.gov' },
        { name: 'VA News', url: 'https://news.va.gov' },
        { name: 'SEC Filings', url: 'https://www.sec.gov/cgi-bin/browse-edgar' },
        { name: 'FRED Economic Data', url: 'https://fred.stlouisfed.org' },
        { name: 'Bureau of Labor Statistics', url: 'https://www.bls.gov' },
        { name: 'Congress.gov', url: 'https://www.congress.gov' },
      ],
      // Social platforms Helix monitors
      social: [
        { name: 'Reddit', url: 'https://www.reddit.com', api: 'https://www.reddit.com/r/{subreddit}/new.json' },
        { name: 'X / Twitter', url: 'https://x.com' },
        { name: 'Discord Communities', url: 'https://discord.com' },
        { name: 'Hacker News', url: 'https://news.ycombinator.com', api: 'https://hacker-news.firebaseio.com/v0/' },
        { name: 'Indie Hackers', url: 'https://www.indiehackers.com' },
      ],
      // Trading specific
      trading: [
        { name: 'TradingView Ideas', url: 'https://www.tradingview.com/ideas/' },
        { name: 'Polymarket', url: 'https://polymarket.com' },
        { name: 'Kalshi', url: 'https://kalshi.com' },
        { name: 'Deribit Insights', url: 'https://insights.deribit.com' },
        { name: 'Glassnode', url: 'https://glassnode.com' },
        { name: 'CryptoQuant', url: 'https://cryptoquant.com' },
      ]
    };
  }

  // Get all registered sources
  getSources() {
    const summary = {};
    let total = 0;
    for (const [category, sources] of Object.entries(this.sources)) {
      summary[category] = sources.map(s => s.name);
      total += sources.length;
    }
    return { categories: summary, totalSources: total };
  }

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

  ingestBatch(articles) { return articles.map(a => this.ingestArticle(a)); }

  categorize(text) {
    const lower = text.toLowerCase();
    if (/fed|rate|inflation|treasury|bond|monetary|fomc/.test(lower)) return 'macro';
    if (/crypto|bitcoin|ethereum|blockchain|token|defi|nft/.test(lower)) return 'crypto';
    if (/earnings|revenue|profit|quarterly|eps/.test(lower)) return 'earnings';
    if (/ai|artificial|model|agent|llm|neural|anthropic|openai|google ai/.test(lower)) return 'ai';
    if (/regulation|sec|congress|bill|law|compliance|ban/.test(lower)) return 'regulation';
    if (/war|conflict|sanctions|military|geopolitical|nato/.test(lower)) return 'geopolitical';
    if (/veteran|va |disability|benefits|claim|service-connected/.test(lower)) return 'veteran';
    if (/worker|labor|union|wage|employment|jobs|layoff|hiring/.test(lower)) return 'labor';
    if (/housing|rent|mortgage|real estate|property|eviction/.test(lower)) return 'housing';
    if (/climate|carbon|renewable|solar|wind|emission/.test(lower)) return 'climate';
    if (/health|hospital|fda|pharma|mental health|insurance/.test(lower)) return 'health';
    return 'general';
  }

  analyzeSentiment(text) {
    const lower = text.toLowerCase();
    const positive = ['surge', 'rally', 'growth', 'record', 'breakthrough', 'approval', 'gain', 'bullish', 'strong', 'boom', 'soar', 'jump', 'upgrade', 'beat'];
    const negative = ['crash', 'decline', 'loss', 'fear', 'collapse', 'warning', 'bearish', 'weak', 'crisis', 'plunge', 'fraud', 'scam', 'dump', 'layoff', 'cut', 'miss'];
    const posCount = positive.filter(w => lower.includes(w)).length;
    const negCount = negative.filter(w => lower.includes(w)).length;
    if (posCount > negCount + 1) return { score: 0.7, label: 'positive' };
    if (negCount > posCount + 1) return { score: -0.7, label: 'negative' };
    if (posCount > negCount) return { score: 0.3, label: 'slightly-positive' };
    if (negCount > posCount) return { score: -0.3, label: 'slightly-negative' };
    return { score: 0, label: 'neutral' };
  }

  extractTickers(text) {
    const tickers = [
      'AAPL','NVDA','TSLA','MSFT','GOOGL','AMZN','META','NFLX','AMD','INTC',
      'CRM','ORCL','UBER','LYFT','SQ','PYPL','COIN','HOOD','PLTR','SNOW',
      'BTC','ETH','SOL','ADA','DOGE','LINK','AVAX','DOT','MATIC','XRP',
      'SPY','QQQ','DIA','IWM','VTI','VOO','ARKK'
    ];
    const upper = text.toUpperCase();
    return tickers.filter(t => upper.includes(t));
  }

  getLatest(limit = 20) { return this.articles.slice(0, limit); }
  getByCategory(category, limit = 10) { return this.articles.filter(a => a.category === category).slice(0, limit); }
  getByTicker(ticker, limit = 10) { return this.articles.filter(a => a.tickers.includes(ticker.toUpperCase())).slice(0, limit); }

  getSentimentOverview() {
    const recent = this.articles.slice(0, 50);
    if (recent.length === 0) return { overall: 'awaiting data', score: 0, articleCount: 0, categories: {}, sources: this.getSources() };
    const avg = recent.reduce((sum, a) => sum + a.sentiment.score, 0) / recent.length;
    const categories = {};
    for (const a of recent) {
      if (!categories[a.category]) categories[a.category] = { count: 0, sentiment: 0 };
      categories[a.category].count++;
      categories[a.category].sentiment += a.sentiment.score;
    }
    for (const cat of Object.values(categories)) cat.sentiment = (cat.sentiment / cat.count).toFixed(2);
    return { overall: avg > 0.2 ? 'positive' : avg < -0.2 ? 'negative' : 'neutral', score: avg.toFixed(2), articleCount: recent.length, categories, sources: this.getSources(), timestamp: new Date().toISOString() };
  }
}

module.exports = NewsConnector;
