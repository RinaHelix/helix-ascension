const ConnectorBase = require('./connector-base');

class CryptoConnector extends ConnectorBase {
  constructor() {
    super('Crypto Intelligence', { type: 'market-data' });
    this.cache = {};
    this.cacheTime = 60000;
    this.watchlist = [
      'bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin', 
      'chainlink', 'avalanche-2', 'polkadot', 'polygon', 'litecoin',
      'uniswap', 'aave', 'maker', 'cosmos', 'near', 'arbitrum',
      'optimism', 'render-token', 'injective-protocol', 'sui'
    ];
    this.symbols = {
      'bitcoin':'BTC','ethereum':'ETH','solana':'SOL','cardano':'ADA',
      'dogecoin':'DOGE','chainlink':'LINK','avalanche-2':'AVAX',
      'polkadot':'DOT','polygon':'MATIC','litecoin':'LTC',
      'uniswap':'UNI','aave':'AAVE','maker':'MKR','cosmos':'ATOM',
      'near':'NEAR','arbitrum':'ARB','optimism':'OP',
      'render-token':'RNDR','injective-protocol':'INJ','sui':'SUI'
    };
  }

  async fetchPrices() {
    const now = Date.now();
    if (this.cache.prices && now - this.cache.pricesTime < this.cacheTime) return this.cache.prices;
    try {
      const ids = this.watchlist.join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`);
      const data = await res.json();
      if (data.error || data.status) throw new Error(data.error || 'API returned status object');
      this.cache.prices = data;
      this.cache.pricesTime = now;
      return data;
    } catch (err) {
      console.log(`[Crypto] Price fetch error: ${err.message}`);
      return this.cache.prices || {};
    }
  }

  async fetchTrending() {
    const now = Date.now();
    if (this.cache.trending && now - this.cache.trendingTime < this.cacheTime * 5) return this.cache.trending;
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
      const data = await res.json();
      this.cache.trending = (data.coins || []).map(c => ({
        name: c.item.name,
        symbol: c.item.symbol,
        rank: c.item.market_cap_rank,
        price_btc: c.item.price_btc
      }));
      this.cache.trendingTime = now;
      return this.cache.trending;
    } catch (err) {
      console.log(`[Crypto] Trending fetch error: ${err.message}`);
      return this.cache.trending || [];
    }
  }

  async fetchGlobalData() {
    const now = Date.now();
    if (this.cache.global && now - this.cache.globalTime < this.cacheTime * 2) return this.cache.global;
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/global');
      const data = await res.json();
      this.cache.global = {
        totalMarketCap: data.data?.total_market_cap?.usd,
        totalVolume: data.data?.total_volume?.usd,
        btcDominance: data.data?.market_cap_percentage?.btc,
        ethDominance: data.data?.market_cap_percentage?.eth,
        activeCryptos: data.data?.active_cryptocurrencies,
        markets: data.data?.markets
      };
      this.cache.globalTime = now;
      return this.cache.global;
    } catch (err) {
      console.log(`[Crypto] Global data error: ${err.message}`);
      return this.cache.global || {};
    }
  }

  async fetchFearGreedIndex() {
    const now = Date.now();
    if (this.cache.fear && now - this.cache.fearTime < this.cacheTime * 10) return this.cache.fear;
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=7');
      const data = await res.json();
      this.cache.fear = (data.data || []).map(d => ({
        value: parseInt(d.value),
        label: d.value_classification,
        timestamp: new Date(d.timestamp * 1000).toISOString()
      }));
      this.cache.fearTime = now;
      return this.cache.fear;
    } catch (err) {
      console.log(`[Crypto] Fear & Greed error: ${err.message}`);
      return this.cache.fear || [];
    }
  }

  generateSignal(data) {
    const change = data.usd_24h_change || 0;
    if (change < -8) return { action: 'AVOID', reason: 'Extreme sell-off — potential pump-dump recovery trap', confidence: 15 };
    if (change < -5) return { action: 'CAUTION', reason: 'Heavy decline — wait for stabilization', confidence: 30 };
    if (change < -2) return { action: 'WATCH', reason: 'Moderate decline — monitor for reversal', confidence: 40 };
    if (change > 10) return { action: 'CAUTION', reason: 'Extreme rally — possible overextension', confidence: 25 };
    if (change > 5) return { action: 'MOMENTUM', reason: 'Strong uptrend — verify with volume', confidence: 55 };
    if (change > 2) return { action: 'WATCH', reason: 'Moderate gain — could continue', confidence: 50 };
    return { action: 'NEUTRAL', reason: 'Normal range — no strong directional signal', confidence: 35 };
  }

  async getMarketOverview() {
    const [prices, trending, global, fearGreed] = await Promise.all([
      this.fetchPrices(),
      this.fetchTrending(),
      this.fetchGlobalData(),
      this.fetchFearGreedIndex()
    ]);

    const assets = {};
    for (const [id, data] of Object.entries(prices)) {
      if (!data || !data.usd) continue;
      const sym = this.symbols[id] || id.toUpperCase();
      assets[sym] = {
        id,
        price: data.usd,
        change24h: data.usd_24h_change ? parseFloat(data.usd_24h_change.toFixed(2)) : 0,
        marketCap: data.usd_market_cap || 0,
        volume24h: data.usd_24h_vol || 0,
        signal: this.generateSignal(data)
      };
    }

    return {
      assets,
      global,
      fearGreed: fearGreed[0] || null,
      fearGreedHistory: fearGreed,
      trending: trending.slice(0, 7),
      assetCount: Object.keys(assets).length,
      timestamp: new Date().toISOString(),
      sources: ['CoinGecko Free API', 'Alternative.me Fear & Greed Index'],
      disclaimer: 'CRITICAL Rule 9: Paper trading only. This is data, not advice.'
    };
  }
}

module.exports = CryptoConnector;
