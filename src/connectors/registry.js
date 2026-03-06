// registry.js — Connector Registry
// Central hub. Every platform Rina touches is registered here.
// Governor sees everything. CRITICAL.md governs everything.
// 
// Phase 1 (now — free): News, Wikipedia, public data
// Phase 2 (API credits): Reddit, YouTube metadata, crypto prices
// Phase 3 (revenue): TradingView, Webull, streaming, full social
//
// The architecture is ready for all of them. We connect as we grow.

class ConnectorRegistry {
  constructor() {
    this.connectors = {};
    this.categories = {
      knowledge: [],    // Wikipedia, news, education
      financial: [],    // Crypto, stocks, trading platforms
      social: [],       // Reddit, X, Instagram, YouTube
      tools: [],        // Code, AI platforms, productivity
      crisis: [],       // Mental health, emergency, support
      community: []     // Forums, local resources, networking
    };
  }

  // Register a connector
  register(connector) {
    if (this.connectors[connector.name]) {
      throw new Error(`Connector "${connector.name}" already registered.`);
    }
    this.connectors[connector.name] = connector;

    if (this.categories[connector.type]) {
      this.categories[connector.type].push(connector.name);
    }

    return true;
  }

  // Get a connector by name
  get(name) {
    return this.connectors[name] || null;
  }

  // Connect all registered connectors
  async connectAll() {
    const results = [];
    for (const [name, connector] of Object.entries(this.connectors)) {
      try {
        await connector.connect();
        results.push({ name, status: 'connected' });
      } catch (error) {
        results.push({ name, status: 'failed', reason: error.message });
      }
    }
    return results;
  }

  // Rina asks the registry: "I need info about X" — registry finds the right connector
  async query(intent, params = {}) {
    const category = this._matchCategory(intent);
    const connectorNames = this.categories[category] || [];

    if (connectorNames.length === 0) {
      return {
        status: 'no_connector',
        intent,
        category,
        message: `No connector available for "${category}" yet. This is on the roadmap.`,
        roadmap: this._getRoadmapForCategory(category)
      };
    }

    const results = [];
    for (const name of connectorNames) {
      const connector = this.connectors[name];
      if (connector.connected) {
        try {
          const data = await connector.fetch(params);
          results.push({ source: name, data });
        } catch (error) {
          results.push({ source: name, error: error.message });
        }
      }
    }

    return {
      status: results.length > 0 ? 'found' : 'offline',
      intent,
      category,
      results
    };
  }

  // Match user intent to connector category
  _matchCategory(intent) {
    const lower = intent.toLowerCase();
    const map = {
      knowledge: ['learn', 'what is', 'explain', 'how does', 'teach', 'understand', 'history', 'science', 'education'],
      financial: ['stock', 'crypto', 'bitcoin', 'trade', 'invest', 'money', 'market', 'price', 'portfolio', 'finance'],
      social: ['reddit', 'youtube', 'twitter', 'instagram', 'post', 'trending', 'video', 'stream', 'social'],
      tools: ['code', 'build', 'ai', 'automate', 'script', 'program', 'develop', 'chatgpt', 'gemini'],
      crisis: ['help', 'crisis', 'suicide', 'emergency', 'abuse', 'danger', 'scared', 'hurt', 'need help'],
      community: ['connect', 'people', 'group', 'local', 'community', 'network', 'mentor', 'find someone']
    };

    for (const [category, keywords] of Object.entries(map)) {
      if (keywords.some(k => lower.includes(k))) return category;
    }
    return 'knowledge';
  }

  // What is coming for each category
  _getRoadmapForCategory(category) {
    const roadmap = {
      knowledge: 'Phase 1: Wikipedia, news APIs, educational content — available now',
      financial: 'Phase 2: Alpaca paper trading live. Crypto prices, TradingView, Webull — when revenue starts',
      social: 'Phase 2: Reddit public API, YouTube metadata. Phase 3: Full social integration',
      tools: 'Phase 2: Code assistance, AI model comparison. Built on the Governor architecture',
      crisis: 'Phase 1: Crisis resource database — building now. 988 Lifeline, local resources, real support',
      community: 'Phase 3: Profile system, craft showcase, builder network — the MySpace principle evolved'
    };
    return roadmap[category] || 'On the roadmap. Building right, not fast.';
  }

  // Full status of all connectors
  getStatus() {
    return {
      totalConnectors: Object.keys(this.connectors).length,
      categories: Object.entries(this.categories).map(([cat, names]) => ({
        category: cat,
        connectors: names,
        count: names.length
      })),
      connectors: Object.values(this.connectors).map(c => c.getStatus())
    };
  }

  // List what is available vs what is coming
  getAvailability() {
    const available = [];
    const coming = [];

    for (const connector of Object.values(this.connectors)) {
      if (connector.connected) {
        available.push({ name: connector.name, type: connector.type });
      } else {
        coming.push({
          name: connector.name,
          type: connector.type,
          reason: connector.requiresPayment ? 'Requires revenue' : connector.requiresAuth ? 'Requires API key' : 'Ready to connect'
        });
      }
    }

    return { available, coming };
  }
}

module.exports = ConnectorRegistry;
