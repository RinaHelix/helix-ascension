// connector-base.js — Universal Connector Architecture
// Every platform Helix touches goes through this interface.

class Connector {
  constructor(name, config = {}) {
    if (!name) throw new Error('Every connector must have a name.');
    this.name = name;
    this.type = config.type || 'unknown';
    this.status = 'initialized';
    this.connected = false;
    this.requiresAuth = config.requiresAuth || false;
    this.requiresPayment = config.requiresPayment || false;
    this.rateLimitPerMinute = config.rateLimitPerMinute || 60;
    this.callCount = 0;
    this.lastReset = Date.now();
    this.log = [];
  }

  _checkRateLimit() {
    const now = Date.now();
    if (now - this.lastReset > 60000) {
      this.callCount = 0;
      this.lastReset = now;
    }
    if (this.callCount >= this.rateLimitPerMinute) {
      return { allowed: false, reason: `Rate limit: ${this.rateLimitPerMinute}/min for ${this.name}` };
    }
    this.callCount++;
    return { allowed: true };
  }

  _log(action, details) {
    this.log.push({
      timestamp: new Date().toISOString(),
      connector: this.name,
      action,
      details
    });
  }

  async connect() {
    throw new Error(`${this.name} must implement connect()`);
  }

  async fetch(query) {
    throw new Error(`${this.name} must implement fetch()`);
  }

  async disconnect() {
    this.connected = false;
    this.status = 'disconnected';
    this._log('disconnect', {});
  }

  getStatus() {
    return {
      name: this.name,
      type: this.type,
      status: this.status,
      connected: this.connected,
      requiresAuth: this.requiresAuth,
      requiresPayment: this.requiresPayment,
      callsThisMinute: this.callCount,
      rateLimit: this.rateLimitPerMinute,
      logEntries: this.log.length
    };
  }

  getLog() { return this.log; }
}

module.exports = Connector;
