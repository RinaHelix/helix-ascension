const ConnectorBase = require('./connector-base');

class TradingViewConnector extends ConnectorBase {
  constructor() {
    super('TradingView', { type: 'market-data' });
    this.signals = [];
    this.maxSignals = 500;
  }

  processWebhook(data) {
    const signal = {
      id: `tv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ticker: data.ticker || data.symbol || 'UNKNOWN',
      price: parseFloat(data.price) || 0,
      action: (data.action || data.strategy || 'INFO').toUpperCase(),
      timeframe: data.timeframe || data.interval || '1D',
      indicator: data.indicator || null,
      message: data.message || null,
      volume: parseFloat(data.volume) || null,
      exchange: data.exchange || null,
      raw: data
    };
    this.signals.unshift(signal);
    if (this.signals.length > this.maxSignals) this.signals = this.signals.slice(0, this.maxSignals);
    this._log("info", `Signal: ${signal.ticker} ${signal.action} @ ${signal.price}`);
    return signal;
  }

  getSignals(limit = 20) { return this.signals.slice(0, limit); }

  getTickerSignals(ticker, limit = 10) {
    return this.signals.filter(s => s.ticker.toUpperCase() === ticker.toUpperCase()).slice(0, limit);
  }

  getLatestByTicker() {
    const latest = {};
    for (const s of this.signals) { if (!latest[s.ticker]) latest[s.ticker] = s; }
    return latest;
  }

  getSummary() {
    const tickers = {};
    for (const s of this.signals.slice(0, 50)) {
      if (!tickers[s.ticker]) tickers[s.ticker] = { buys: 0, sells: 0, holds: 0, latest: s };
      if (s.action === 'BUY') tickers[s.ticker].buys++;
      else if (s.action === 'SELL') tickers[s.ticker].sells++;
      else tickers[s.ticker].holds++;
    }
    return { totalSignals: this.signals.length, activeTickers: Object.keys(tickers).length, tickers, lastUpdate: this.signals[0]?.timestamp || null };
  }
}

module.exports = TradingViewConnector;
