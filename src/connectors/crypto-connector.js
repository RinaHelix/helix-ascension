const ConnectorBase = require('./connector-base');

class CryptoConnector extends ConnectorBase {
  constructor() {
    super({
      name: 'Crypto Intelligence',
      type: 'market-data',
      description: 'Crypto market data from CoinGecko + on-chain signals',
      alwaysActive: true
    });
    this.cache = {};
    this.cacheTime = 60000; // 60 second cache
    this.watchlist = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin', 'chainlink', 'avalanche-2', 'polygon'];
  }

  // CoinGecko free API — no key needed
  async fetchPrices() {
    const now = Date.now();
    if (this.cache.prices && now - this.cache.pricesTime < this.cacheTime) return this.cache.prices;

    try {
      const ids = this.watchlist.join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`);
      const data = await res.json();
      this.cache.prices = data;
      this.cache.pricesTime = now;
      this.log(`Fetched prices for ${Object.keys(data).length} assets`);
      return data;
    } catch (err) {
      this.log(`Price fetch error: ${err.message}`);
      return this.cache.prices || {};
    }
  }

  async fetchTrending() {
    const now = Date.now();
    if (this.cache.trending && now - this.cache.trendingTime < this.cacheTime * 5) return this.cache.trending;

    try {
      const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
      const data = await res.json();
      this.cache.trending = data.coins?.map(c => ({
        name: c.item.name,
        symbol: c.item.symbol,
        rank: c.item.market_cap_rank,
        price_btc: c.item.price_btc
      })) || [];
      this.cache.trendingTime = now;
      return this.cache.trending;
    } catch (err) {
      this.log(`Trending fetch error: ${err.message}`);
      return this.cache.trending || [];
    }
  }

  async getMarketOverview() {
    const [prices, trending] = await Promise.all([this.fetchPrices(), this.fetchTrending()]);
    
    const formatted = {};
    for (const [id, data] of Object.entries(prices)) {
      formatted[id] = {
        price: data.usd,
        change24h: data.usd_24h_change,
        marketCap: data.usd_market_cap,
        volume24h: data.usd_24h_vol,
        signal: this.generateSignal(data)
      };
    }

    return {
      assets: formatted,
      trending: trending.slice(0, 7),
      timestamp: new Date().toISOString(),
      source: 'CoinGecko Free API',
      disclaimer: 'CRITICAL Rule 9: Paper trading only. This is data, not advice.'
    };
  }

  generateSignal(data) {
    const change = data.usd_24h_change || 0;
    if (change < -8) return { action: 'AVOID', reason: 'Extreme sell-off — potential pump-dump recovery trap', confidence: 'low' };
    if (change < -3) return { action: 'WATCH', reason: 'Significant decline — wait for stabilization', confidence: 'medium' };
    if (change > 8) return { action: 'CAUTION', reason: 'Extreme rally — possible overextension', confidence: 'low' };
    if (change > 3) return { action: 'MOMENTUM', reason: 'Strong uptrend — but verify with volume', confidence: 'medium' };
    return { action: 'NEUTRAL', reason: 'Normal range — no strong signal', confidence: 'low' };
  }

  log(msg) { console.log(`[Crypto] ${new Date().toISOString()} — ${msg}`); }
}

module.exports = CryptoConnector;
