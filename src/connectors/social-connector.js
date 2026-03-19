const ConnectorBase = require('./connector-base');

class SocialConnector extends ConnectorBase {
  constructor() {
    super('Social Intelligence', { type: 'social-data' });
    this.signals = [];
    this.maxSignals = 1000;
    
    // Every community Helix monitors
    this.trackedSubreddits = {
      finance: ['wallstreetbets', 'stocks', 'investing', 'cryptocurrency', 'personalfinance', 'povertyfinance', 'financialindependence', 'CreditCards', 'tax'],
      work: ['jobs', 'careerguidance', 'antiwork', 'overemployed', 'freelance', 'smallbusiness', 'entrepreneur', 'startups'],
      trades: ['HVAC', 'plumbing', 'electricians', 'construction', 'Welding', 'Roofing', 'Carpentry'],
      medical: ['nursing', 'medicine', 'residency', 'pharmacy', 'mentalhealth', 'therapists', 'ptsd'],
      legal: ['legaladvice', 'immigration', 'disability', 'landlord', 'TenantHelp'],
      veteran: ['veterans', 'VeteransBenefits', 'MilitaryFinance', 'army', 'navy', 'airforce', 'USMC'],
      tech: ['artificial', 'MachineLearning', 'LocalLLaMA', 'ClaudeAI', 'ChatGPT', 'webdev', 'programming', 'learnprogramming'],
      ai_agents: ['ClaudeCode', 'OpenClaw', 'AutoGPT', 'LangChain'],
      education: ['teachers', 'teaching', 'college', 'GradSchool', 'StudentLoans'],
      creator: ['NewTubers', 'Twitch', 'InstagramMarketing', 'socialmedia', 'content_marketing'],
      housing: ['RealEstate', 'FirstTimeHomeBuyer', 'landlord', 'povertyfinance'],
      crypto: ['CryptoMarkets', 'defi', 'ethfinance', 'solana', 'Bitcoin'],
      gig: ['UberDrivers', 'doordash_drivers', 'InstacartShoppers', 'lyftdrivers', 'gigwork'],
      hospitality: ['KitchenConfidential', 'TalesFromTheFrontDesk', 'bartenders', 'Serverlife']
    };

    // X/Twitter accounts Helix watches for signal
    this.trackedXAccounts = {
      ai: ['@AnthropicAI', '@OpenAI', '@GoogleDeepMind', '@ylecun', '@kabortz', '@elaborateangels', '@sama'],
      crypto: ['@VitalikButerin', '@cabortz', '@CoinDesk', '@whale_alert', '@cryptoquant_com'],
      finance: ['@zabortz', '@FedPresidents', '@SECGov', '@POTUS', '@elaborateangels'],
      agents: ['@OpenClaw', '@mabortz', '@LangChainAI', '@CrewAIInc'],
      builders: ['@levelsio', '@pabortz', '@tabortz', '@sabortz']
    };

    this.trackedTopics = [
      'AI agents', 'OpenClaw', 'prediction markets', 'Polymarket', 'gig economy',
      'wage theft', 'VA benefits', 'financial literacy', 'burnout', 'side hustle',
      'automation', 'reskilling', 'freelance', 'crypto regulation', 'AI regulation',
      'veteran claims', 'TDIU', 'housing crisis', 'student debt', 'mental health',
      'trade skills', 'union organizing', 'content creation', 'passive income',
      'Claude Code', 'vibe coding', 'local models', 'Ollama', 'fine tuning'
    ];
  }

  addSignal(data) {
    const text = (data.title || '') + ' ' + (data.content || data.body || '');
    const signal = {
      id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      platform: data.platform || 'unknown',
      subreddit: data.subreddit || null,
      author: data.author || 'anonymous',
      title: data.title || '',
      content: data.content || data.body || '',
      score: data.score || data.likes || 0,
      comments: data.comments || data.replies || 0,
      url: data.url || null,
      category: this.categorize(text),
      sentiment: this.quickSentiment(text),
      painPoint: this.detectPainPoint(text),
      opportunity: this.detectOpportunity(text),
      vertical: this.mapVertical(text)
    };
    this.signals.unshift(signal);
    if (this.signals.length > this.maxSignals) this.signals = this.signals.slice(0, this.maxSignals);
    return signal;
  }

  categorize(text) {
    const lower = text.toLowerCase();
    if (/money|income|invest|crypto|trading|stock|budget/.test(lower)) return 'finance';
    if (/health|mental|therapy|burnout|stress|anxiety|depression/.test(lower)) return 'health';
    if (/legal|lawyer|rights|claim|court|sue/.test(lower)) return 'legal';
    if (/job|work|career|hire|fired|laid off|resume/.test(lower)) return 'work';
    if (/build|code|app|startup|saas|ship|launch/.test(lower)) return 'building';
    if (/ai|agent|model|automat|llm|gpt|claude/.test(lower)) return 'ai';
    if (/veteran|va |military|service|deploy/.test(lower)) return 'veteran';
    if (/rent|housing|landlord|evict|mortgage|homeless/.test(lower)) return 'housing';
    if (/gig|uber|doordash|instacart|freelance|1099/.test(lower)) return 'gig';
    if (/creator|youtube|tiktok|content|followers|brand deal/.test(lower)) return 'creator';
    if (/trade|hvac|plumb|electric|weld|construct/.test(lower)) return 'trades';
    if (/nurse|doctor|hospital|patient|medical/.test(lower)) return 'medical';
    if (/food|restaurant|kitchen|chef|server|bartend/.test(lower)) return 'hospitality';
    return 'general';
  }

  // Map to Helix whitespace verticals
  mapVertical(text) {
    const lower = text.toLowerCase();
    if (/nurse|hospital|patient|hipaa|medical record|chronic/.test(lower)) return 'Medical';
    if (/lawyer|court|tenant|claim|contract|expunge/.test(lower)) return 'Legal';
    if (/hotel|airbnb|restaurant|food truck|event venue/.test(lower)) return 'Hospitality';
    if (/seo|website|api|app|saas|platform/.test(lower)) return 'Internet';
    if (/creator|brand deal|content|audience|monetiz/.test(lower)) return 'Creator';
    if (/gig|wage|worker|resume|reskill|benefit/.test(lower)) return 'Workers';
    if (/crypto|trading|invest|treasury|credit/.test(lower)) return 'Finance';
    if (/real estate|rental|property|zoning/.test(lower)) return 'Real Estate';
    if (/supply chain|shipping|freight|import/.test(lower)) return 'Supply Chain';
    if (/school|tutor|student|literacy|apprentice/.test(lower)) return 'Education';
    if (/government|permit|benefit|regulation/.test(lower)) return 'Government';
    if (/security|hack|phishing|deepfake/.test(lower)) return 'Security';
    if (/climate|carbon|renewable|agriculture/.test(lower)) return 'Climate';
    if (/music|sports|media|podcast|royalty/.test(lower)) return 'Media';
    return null;
  }

  quickSentiment(text) {
    const lower = text.toLowerCase();
    const frustrated = ['frustrated', 'broken', 'impossible', 'nobody', 'can\'t', 'won\'t', 'scam', 'waste', 'hate', 'stuck', 'desperate', 'terrible', 'awful', 'worst', 'useless'];
    const hopeful = ['finally', 'found', 'works', 'helped', 'changed', 'breakthrough', 'amazing', 'love', 'solved', 'game changer', 'incredible', 'perfect'];
    const fCount = frustrated.filter(w => lower.includes(w)).length;
    const hCount = hopeful.filter(w => lower.includes(w)).length;
    if (fCount > hCount) return 'frustrated';
    if (hCount > fCount) return 'hopeful';
    return 'neutral';
  }

  detectPainPoint(text) {
    const lower = text.toLowerCase();
    const pains = {
      'no_tool': /no tool|nothing exists|nobody built|wish there was|why isn't there|doesn't exist/,
      'too_expensive': /can't afford|too expensive|costs too much|overpriced|pricing is insane|rip off/,
      'too_complex': /too complicated|overwhelming|confusing|don't understand|can't figure|steep learning/,
      'broken_system': /broken system|doesn't work|failing|bureaucracy|red tape|impossible to navigate/,
      'no_access': /no access|can't get|not available|excluded|left out|underserved|no one serves/,
      'exploitation': /exploited|taken advantage|scam|predatory|wage theft|ripped off|stealing/,
      'no_support': /no help|on my own|nobody cares|abandoned|ghosted|ignored/,
      'information_gap': /nobody told me|didn't know|no idea|wish someone told|hidden|secret/
    };
    for (const [key, regex] of Object.entries(pains)) {
      if (regex.test(lower)) return key;
    }
    return null;
  }

  detectOpportunity(text) {
    const lower = text.toLowerCase();
    if (/shut up and take|willing to pay|take my money|i'd pay|here's my money/.test(lower)) return 'high — expressed willingness to pay';
    if (/anyone know|looking for|recommend|alternative to|need a tool/.test(lower)) return 'medium — actively searching';
    if (/frustrated|wish|if only|why can't|someone should/.test(lower)) return 'medium — pain expressed';
    if (/built this|just launched|made a tool|created a/.test(lower)) return 'competitive — someone building';
    return null;
  }

  getSignals(limit = 20) { return this.signals.slice(0, limit); }
  getByCategory(category, limit = 10) { return this.signals.filter(s => s.category === category).slice(0, limit); }
  getByVertical(vertical, limit = 10) { return this.signals.filter(s => s.vertical === vertical).slice(0, limit); }
  getByPainPoint(pain, limit = 10) { return this.signals.filter(s => s.painPoint === pain).slice(0, limit); }

  getPainPointSummary() {
    const pains = {};
    for (const s of this.signals) {
      if (s.painPoint) { if (!pains[s.painPoint]) pains[s.painPoint] = 0; pains[s.painPoint]++; }
    }
    return pains;
  }

  getVerticalSignals() {
    const verts = {};
    for (const s of this.signals) {
      if (s.vertical) { if (!verts[s.vertical]) verts[s.vertical] = 0; verts[s.vertical]++; }
    }
    return verts;
  }

  getTrendingTopics(limit = 15) {
    const topics = {};
    for (const s of this.signals.slice(0, 200)) {
      const text = (s.title + ' ' + s.content).toLowerCase();
      for (const topic of this.trackedTopics) {
        if (text.includes(topic.toLowerCase())) {
          if (!topics[topic]) topics[topic] = 0;
          topics[topic]++;
        }
      }
    }
    return Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([topic, count]) => ({ topic, mentions: count }));
  }

  getOpportunities(limit = 20) {
    return this.signals.filter(s => s.opportunity).slice(0, limit).map(s => ({
      platform: s.platform, title: s.title.slice(0, 120), category: s.category,
      vertical: s.vertical, painPoint: s.painPoint, opportunity: s.opportunity,
      score: s.score, url: s.url
    }));
  }

  // Everything Helix is tracking
  getMonitoringStatus() {
    const totalSubreddits = Object.values(this.trackedSubreddits).flat().length;
    const totalXAccounts = Object.values(this.trackedXAccounts).flat().length;
    return {
      subreddits: this.trackedSubreddits,
      totalSubreddits,
      xAccounts: this.trackedXAccounts,
      totalXAccounts,
      trackedTopics: this.trackedTopics,
      totalTopics: this.trackedTopics.length,
      signalsCollected: this.signals.length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = SocialConnector;
