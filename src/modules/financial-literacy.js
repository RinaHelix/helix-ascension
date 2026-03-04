// financial-literacy.js — Module 1: Financial Literacy
// Universal — serves every other module
// Five levels: Zero to Full Architecture
// CRITICAL Rule 8: Education only. Never financial advice.

const DISCLAIMER = 'Helix provides financial education, not financial advice. ' +
  'Consult a licensed professional before making financial decisions.';

const curriculum = {
  level_1: {
    name: 'Zero to First Dollar',
    description: 'What money is, how it moves, how to start from nothing',
    lessons: [
      { id: 'L1-01', title: 'What money actually is and how it moves', duration: '10 min' },
      { id: 'L1-02', title: 'Budgeting without shame — starting from $0', duration: '15 min' },
      { id: 'L1-03', title: 'Emergency fund — why $1,000 changes everything', duration: '10 min' },
      { id: 'L1-04', title: 'Credit — what it is, how it works, how to build it', duration: '15 min' },
      { id: 'L1-05', title: 'Avoiding predatory systems: payday loans, rent-to-own, high-fee accounts', duration: '15 min' }
    ]
  },
  level_2: {
    name: 'First Capital',
    description: 'Thinking about your first $5k differently',
    lessons: [
      { id: 'L2-01', title: 'How to think about $5k differently than savings', duration: '10 min' },
      { id: 'L2-02', title: 'High yield savings vs checking — the actual difference', duration: '10 min' },
      { id: 'L2-03', title: 'Index funds — set it and forget it foundation', duration: '15 min' },
      { id: 'L2-04', title: 'Paper trading introduction — learning markets without risk', duration: '20 min' }
    ]
  },
  level_3: {
    name: 'Building Structure',
    description: 'From worker to owner mindset',
    lessons: [
      { id: 'L3-01', title: 'When and how to form your first LLC', duration: '15 min' },
      { id: 'L3-02', title: 'Separating personal from business — why it matters', duration: '10 min' },
      { id: 'L3-03', title: 'Basic tax strategy every worker should know', duration: '15 min' },
      { id: 'L3-04', title: 'Asset protection — protecting what you build', duration: '15 min' }
    ]
  },
  level_4: {
    name: 'Allocator Mindset',
    description: 'How money flows, not just how it saves',
    lessons: [
      { id: 'L4-01', title: 'Capital buckets: liquid, growth, real assets, alternatives', duration: '20 min' },
      { id: 'L4-02', title: 'How the wealthy think about money flows', duration: '15 min' },
      { id: 'L4-03', title: 'Introduction to private markets, real estate, IP', duration: '20 min' }
    ]
  },
  level_5: {
    name: 'Full Architecture',
    description: 'Advanced structures — control everything, own nothing',
    lessons: [
      { id: 'L5-01', title: 'Family office structure — what it is, how it works', duration: '20 min' },
      { id: 'L5-02', title: 'Trusts and entities — control everything, own nothing', duration: '25 min' },
      { id: 'L5-03', title: 'Legal jurisdictional diversification', duration: '20 min' },
      { id: 'L5-04', title: 'Financial engineering — borrow against assets, depreciation, foundations', duration: '25 min' }
    ]
  }
};

class FinancialLiteracyModule {
  constructor() {
    this.curriculum = curriculum;
    this.disclaimer = DISCLAIMER;
  }

  assessLevel(userContext = {}) {
    return {
      recommended: 'level_1',
      reason: 'Everyone starts at the foundation. Skip forward when ready.',
      disclaimer: this.disclaimer
    };
  }

  getOverview() {
    return Object.entries(this.curriculum).map(([key, level]) => ({
      id: key,
      name: level.name,
      description: level.description,
      lessonCount: level.lessons.length,
      totalDuration: level.lessons.reduce((sum, l) => {
        const mins = parseInt(l.duration);
        return sum + (isNaN(mins) ? 0 : mins);
      }, 0) + ' min'
    }));
  }

  getLesson(lessonId) {
    for (const level of Object.values(this.curriculum)) {
      const lesson = level.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return {
          ...lesson,
          levelName: level.name,
          disclaimer: this.disclaimer,
          content: 'pending_content_creation'
        };
      }
    }
    return null;
  }
}

module.exports = FinancialLiteracyModule;
