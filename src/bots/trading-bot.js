// trading-bot.js — PAPER TRADING ONLY
// CRITICAL Rule 9: Paper trading default. Stop-loss required.
// CRITICAL Rule 1: No live trades without human approval.
// This bot does ONE job: analyze and simulate trades.

const config = {
  dry_run: true,
  paper: true,
  stop_loss_pct: 0.02,
  max_position_pct: 0.05,
  max_daily_trades: 10
};

const tradingBot = {
  job: 'paper-trade-analysis',
  allowedActions: ['analyze', 'simulateTrade', 'getPortfolio', 'getConfig'],

  async analyze(params) {
    const { ticker } = params;
    if (!ticker) throw new Error('Ticker required');
    return {
      ticker: ticker.toUpperCase(),
      analysis: 'pending_market_data',
      config: { stopLoss: config.stop_loss_pct, maxPosition: config.max_position_pct },
      note: 'Connect Alpaca API for live market data'
    };
  },

  async simulateTrade(params) {
    const { ticker, side, quantity, price } = params;
    if (!config.paper) {
      throw new Error('CRITICAL VIOLATION: Paper mode disabled. Halting.');
    }
    const stopLossPrice = side === 'buy'
      ? price * (1 - config.stop_loss_pct)
      : price * (1 + config.stop_loss_pct);
    return {
      status: 'simulated',
      paper: true,
      trade: {
        ticker: ticker.toUpperCase(),
        side,
        quantity,
        entryPrice: price,
        stopLoss: stopLossPrice,
        maxLoss: `${(config.stop_loss_pct * 100).toFixed(1)}%`,
        positionValue: quantity * price
      },
      timestamp: new Date().toISOString()
    };
  },

  async getPortfolio() {
    return {
      mode: 'paper',
      balance: 100000,
      positions: [],
      note: 'Paper portfolio — no real money at risk'
    };
  },

  async getConfig() {
    return { ...config };
  }
};

module.exports = tradingBot;
