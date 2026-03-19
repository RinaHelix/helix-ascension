const ConnectorBase = require('./connector-base');

class SocialConnector extends ConnectorBase {
  constructor() {
    super('Social Intelligence', { type: 'social-data' });
    this.signals = [];
    this.maxSignals = 500;
    this.trackedSubreddits = [
      'startups', 'entrepreneur', 'freelance', 'HVAC', 'plumbing', 'landlord',
      'therapists', 'nursing', 'veterans', 'personalfinance', 'povertyfinance',
      'cryptocurrency', 'wallstreetbets', 'smallbusiness', 'legaladvice',
      'teachers', 'construction', 'cybersecurity', 'artificial'
    ];
    this.trackedTopics = [
      'AI agents', 'OpenClaw', 'prediction markets', 'gig economy',
      'wage theft', 'VA benefits', 'financial literacy', 'burnout',
      'side hustle', 'automation', 'reskilling', 'freelance'
    ];
  }

  // Ingest a social signal
  addSignal(data) {
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
      category: this.categorize(data.title + ' ' + (data.content || '')),
      sentiment: this.quickSentiment(data.title + ' ' + (data.content || '')),
      painPoint: this.detectPainPoint(data.title + ' ' + (data.content || '')),
      opportunity: this.detectOpportunity(data.title + ' ' + (data.content || ''))
    };

    this.signals.unshift(signal);
    if (this.signals.length > this.maxSignals) this.signals = this.signals.slice(0, this.maxSignals);
    return signal;
  }

  categorize(text) {
    const lower = text.toLowerCase();
    if (/money|income|invest|crypto|trading|stock/.test(lower)) return 'finance';
    if (/health|mental|therapy|burnout|stress/.test(lower)) return 'health';
    if (/legal|lawyer|rights|claim|court/.test(lower)) return 'legal';
    if (/job|work|career|hire|fired|laid off/.test(lower)) return 'work';
    if (/build|code|app|startup|saas/.test(lower)) return 'building';
    if (/ai|agent|model|automat|llm/.test(lower)) return 'ai';
    if (/veteran|va |military|service/.test(lower)) return 'veteran';
    if (/rent|housing|landlord|evict/.test(lower)) return 'housing';
    return 'general';
  }

  quickSentiment(text) {
    const lower = text.toLowerCase();
    const frustrated = ['frustrated', 'broken', 'impossible', 'nobody', 'can\'t', 'won\'t', 'scam', 'waste', 'hate', 'stuck', 'desperate'];
    const hopeful = ['finally', 'found', 'works', 'helped', 'changed', 'breakthrough', 'amazing', 'love', 'solved'];
    const fCount = frustrated.filter(w => lower.includes(w)).length;
    const hCount = hopeful.filter(w => lower.includes(w)).length;
    if (fCount > hCount) return 'frustrated';
    if (hCount > fCount) return 'hopeful';
    return 'neutral';
  }

  // Detect pain points — these become Helix opportunities
  detectPainPoint(text) {
    const lower = text.toLowerCase();
    const pains = {
      'no_tool': /no tool|nothing exists|nobody built|wish there was|why isn't there/,
      'too_expensive': /can't afford|too expensive|costs too much|overpriced|pricing/,
      'too_complex': /too complicated|overwhelming|confusing|don't understand|can't figure/,
      'broken_system': /broken system|doesn't work|failing|bureaucracy|red tape/,
      'no_access': /no access|can't get|not available|excluded|left out|underserved/,
      'exploitation': /exploited|taken advantage|scam|predatory|wage theft|ripped off/
    };
    for (const [key, regex] of Object.entries(pains)) {
      if (regex.test(lower)) return key;
    }
    return null;
  }

  detectOpportunity(text) {
    const lower = text.toLowerCase();
    if (/willing to pay|shut up and take|need this|someone build|i'd pay/.test(lower)) return 'high — expressed willingness to pay';
    if (/anyone know|looking for|recommend|alternative to/.test(lower)) return 'medium — actively searching';
    if (/frustrated|wish|if only|why can't/.test(lower)) return 'medium — pain expressed';
    return null;
  }

  getSignals(limit = 20) { return this.signals.slice(0, limit); }

  getByCategory(category, limit = 10) {
    return this.signals.filter(s => s.category === category).slice(0, limit);
  }

  getByPainPoint(pain, limit = 10) {
    return this.signals.filter(s => s.painPoint === pain).slice(0, limit);
  }

  getPainPointSummary() {
    const pains = {};
    for (const s of this.signals) {
      if (s.painPoint) {
        if (!pains[s.painPoint]) pains[s.painPoint] = 0;
        pains[s.painPoint]++;
      }
    }
    return pains;
  }

  getTrendingTopics(limit = 10) {
    const topics = {};
    for (const s of this.signals.slice(0, 100)) {
      const words = (s.title + ' ' + s.content).toLowerCase().split(/\s+/);
      for (const topic of this.trackedTopics) {
        if (words.some(w => topic.toLowerCase().includes(w))) {
          if (!topics[topic]) topics[topic] = 0;
          topics[topic]++;
        }
      }
    }
    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([topic, count]) => ({ topic, mentions: count }));
  }

  getOpportunities() {
    return this.signals
      .filter(s => s.opportunity)
      .slice(0, 20)
      .map(s => ({
        platform: s.platform,
        title: s.title.slice(0, 100),
        category: s.category,
        painPoint: s.painPoint,
        opportunity: s.opportunity,
        score: s.score,
        url: s.url
      }));
  } — ${msg}`); }
}

module.exports = SocialConnector;
