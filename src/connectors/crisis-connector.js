// crisis-connector.js — The Most Important Connector
// If someone comes to Helix in crisis, this is the first thing that fires.
// No API needed. No payment needed. Just real resources. Always available.
// CRITICAL Rule 8: Education and resources only. Never diagnose.

const Connector = require('./connector-base');

class CrisisConnector extends Connector {
  constructor() {
    super('crisis-resources', {
      type: 'crisis',
      requiresAuth: false,
      requiresPayment: false,
      rateLimitPerMinute: 999
    });

    this.resources = {
      suicide_prevention: {
        name: '988 Suicide & Crisis Lifeline',
        contact: 'Call or text 988',
        available: '24/7',
        languages: ['English', 'Spanish'],
        note: 'Free, confidential support for people in distress'
      },
      crisis_text: {
        name: 'Crisis Text Line',
        contact: 'Text HOME to 741741',
        available: '24/7',
        languages: ['English', 'Spanish'],
        note: 'Text-based crisis support'
      },
      veterans_crisis: {
        name: 'Veterans Crisis Line',
        contact: 'Call 988, press 1. Or text 838255',
        available: '24/7',
        languages: ['English'],
        note: 'For veterans, service members, and their families'
      },
      domestic_violence: {
        name: 'National Domestic Violence Hotline',
        contact: '1-800-799-7233',
        available: '24/7',
        languages: ['English', 'Spanish', '200+ through interpreters'],
        note: 'Safety planning, resources, support'
      },
      substance_abuse: {
        name: 'SAMHSA National Helpline',
        contact: '1-800-662-4357',
        available: '24/7, 365 days',
        languages: ['English', 'Spanish'],
        note: 'Free referrals and information. Treatment, support groups, community organizations'
      },
      eating_disorders: {
        name: 'National Alliance for Eating Disorders Helpline',
        contact: '1-866-662-1235',
        available: 'Monday-Friday',
        languages: ['English'],
        note: 'Support, resources, and treatment referrals'
      },
      child_abuse: {
        name: 'Childhelp National Child Abuse Hotline',
        contact: '1-800-422-4453',
        available: '24/7',
        languages: ['English', 'Spanish'],
        note: 'Crisis intervention, information, referrals'
      },
      financial_crisis: {
        name: '211 Community Resources',
        contact: 'Dial 211',
        available: '24/7',
        languages: ['Multiple'],
        note: 'Connects to local help — food, housing, utilities, financial assistance'
      },
      international: {
        name: 'International Association for Suicide Prevention',
        contact: 'https://www.iasp.info/resources/Crisis_Centres/',
        available: 'Varies by country',
        languages: ['Multiple'],
        note: 'Crisis centers worldwide. Helix reaches everywhere.'
      }
    };
  }

  async connect() {
    this.connected = true;
    this.status = 'active';
    this._log('connect', { resources: Object.keys(this.resources).length });
    return true;
  }

  async fetch(params = {}) {
    const { type, situation } = params;

    if (type && this.resources[type]) {
      this._log('fetch', { type });
      return {
        resource: this.resources[type],
        message: 'You are not alone. This is a real resource with real people.',
        disclaimer: 'Helix provides resources, not clinical support. These are staffed by trained professionals.'
      };
    }

    if (situation) {
      const matched = this._matchResources(situation);
      this._log('match', { situation: situation.substring(0, 50), matched: matched.length });
      return {
        resources: matched,
        message: 'Here is what is available right now. Real people. Real help.',
        disclaimer: 'Helix provides resources, not clinical support.'
      };
    }

    return {
      resources: Object.values(this.resources),
      message: 'All available crisis resources.',
      disclaimer: 'Helix provides resources, not clinical support.'
    };
  }

  _matchResources(situation) {
    const lower = situation.toLowerCase();
    const matched = [];

    const keywords = {
      suicide_prevention: ['suicide', 'kill myself', 'end it', 'dont want to live', 'no reason to live'],
      crisis_text: ['cant talk', 'text', 'cant call', 'quiet'],
      veterans_crisis: ['veteran', 'military', 'service', 'combat', 'deployment', 'va'],
      domestic_violence: ['abuse', 'hit', 'partner', 'violent', 'scared at home', 'domestic'],
      substance_abuse: ['drugs', 'alcohol', 'addiction', 'sober', 'relapse', 'using', 'drinking'],
      eating_disorders: ['eating', 'food', 'weight', 'purge', 'starving', 'body image'],
      child_abuse: ['child', 'kid', 'minor', 'hurt a child', 'abused as a child'],
      financial_crisis: ['homeless', 'no food', 'evicted', 'cant pay', 'utilities', 'hungry', 'shelter']
    };

    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(w => lower.includes(w))) {
        matched.push(this.resources[key]);
      }
    }

    if (matched.length === 0) {
      matched.push(this.resources.crisis_text);
      matched.push(this.resources.financial_crisis);
    }

    return matched;
  }
}

module.exports = CrisisConnector;
