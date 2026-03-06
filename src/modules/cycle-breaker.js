// cycle-breaker.js — The Core of Helix
// "Global dominance creates a cycle. Global unity creates a better world."
//
// This module identifies the patterns people are stuck in
// and connects them to the doors out.
// Not therapy. Not advice. Education and awareness.
// CRITICAL Rule 8: Education only. Never diagnose.

const CYCLES = {
  work_life_trap: {
    name: 'The Work-Life Trap',
    pattern: 'Working so long you forget you have a life outside of work. No energy left for the people who matter. Corporate smile, sad face at home. Reset. Repeat.',
    signs: [
      'No time for anything but work and sleep',
      'Relationships suffering because of exhaustion',
      'Feeling like stopping is not an option',
      'Forgetting what you enjoy outside of work',
      'Physical health declining but no time to address it'
    ],
    doors: [
      { type: 'awareness', action: 'Name it. You are in a cycle. Recognizing it is the first step.' },
      { type: 'financial', action: 'Learn what your actual number is. Most people work more than they need to because nobody taught them the math.' },
      { type: 'boundaries', action: 'One boundary this week. Not ten. One. See what happens.' },
      { type: 'module', ref: 'financial-literacy', action: 'Start Level 1. Understanding money breaks the fear that keeps you overworking.' }
    ]
  },

  generational_settling: {
    name: 'Generational Settling',
    pattern: 'Generations of people who settled for what they had because they never got the chance to do anything else. Parents who could not show their kids more because nobody showed them. The cycle passes down.',
    signs: [
      'Feeling like this is just how life is',
      'Nobody in your family has done what you want to do',
      'Being told to be realistic when you share a goal',
      'Not knowing what options exist beyond what you see around you',
      'Believing success is for other people'
    ],
    doors: [
      { type: 'awareness', action: 'You are not your circumstances. You are the first one to see the pattern. That matters.' },
      { type: 'knowledge', action: 'Exposure breaks cycles. Learn one new thing about a world you have never accessed.' },
      { type: 'community', action: 'Find one person who broke the same cycle. They exist. Their story will change your math.' },
      { type: 'module', ref: 'financial-literacy', action: 'Level 2 — First Capital. Learn how $5,000 becomes a turning point.' }
    ]
  },

  absent_parent_cycle: {
    name: 'The Absent Parent Cycle',
    pattern: 'Absent parents created by systems broken before they were born. Drugs, violence, incarceration, overwork, or just never learning how to be present. The kids see it. Then they repeat it. Not because they want to. Because it is all they know.',
    signs: [
      'Growing up without a model for what a present parent looks like',
      'Struggling to be present with your own kids',
      'Carrying anger or grief about what you did not have',
      'Not knowing how to break the pattern',
      'Feeling guilty about the time you cannot give'
    ],
    doors: [
      { type: 'awareness', action: 'The cycle is not your fault. But you are the one who can see it. That is power.' },
      { type: 'education', action: 'One resource on breaking family cycles. Not a lecture. A real story from someone who did it.' },
      { type: 'support', action: 'This is not something to carry alone. Connect with others walking the same road.' },
      { type: 'time', action: 'The work-life trap feeds this cycle. Solving one helps solve the other.' }
    ]
  },

  information_desert: {
    name: 'The Information Desert',
    pattern: 'Living where AI has never shown up in a form that speaks to you. Internet is unstable. Literacy is a barrier. English is a foreign language. The whole world is building tools for people who already have access. You got left behind.',
    signs: [
      'Technology feels like it was built for someone else',
      'Language barriers block access to knowledge',
      'Limited or no internet access',
      'Education systems that did not prepare you for the digital world',
      'Feeling invisible to the tech industry'
    ],
    doors: [
      { type: 'access', action: 'Helix is built for you first. Not eventually. From the beginning. Voice-first. Your language. Your level.' },
      { type: 'knowledge', action: 'Start with what matters to you right now. Not what a curriculum says you should learn.' },
      { type: 'community', action: 'Connect with people in your situation who found a path. Local knowledge matters.' },
      { type: 'tools', action: 'Low-bandwidth mode. Offline capability. Real tools that work where you are, not where Silicon Valley wishes you were.' }
    ]
  },

  comparison_trap: {
    name: 'The Comparison Trap',
    pattern: 'People comparing how hard each others lives are rather than saying hey we both have issues lets work together. Social media showing you a life that is not real. Measuring yourself against a filter. The strongest person in one city is the weakest in another. It is all relative.',
    signs: [
      'Constantly measuring yourself against others online',
      'Feeling behind in life based on what you see on screens',
      'Competing with others instead of collaborating',
      'Dismissing your own struggles because someone has it worse',
      'Not celebrating progress because it does not look like someone elses'
    ],
    doors: [
      { type: 'awareness', action: 'What you see online is not real. You know this. But knowing and feeling are different. Start there.' },
      { type: 'reframe', action: 'The hardest working person in one city is the laziest in another. Standards are relative. Build your own.' },
      { type: 'connection', action: 'Find one person to build with instead of compete against. That changes everything.' },
      { type: 'practice', action: 'One week without comparing. Track how you feel. The data will surprise you.' }
    ]
  },

  system_distrust: {
    name: 'System Distrust',
    pattern: 'Every system built to help people has eventually chosen to help itself instead. Banks extract. Platforms addict. Apps manipulate. So people stop trusting anything. And when you stop trusting systems, you stop using tools that could actually help. The broken ones ruined it for everyone.',
    signs: [
      'Avoiding financial systems because you have been burned',
      'Not trusting any institution or organization',
      'Doing everything yourself because nobody else will do it right',
      'Missing opportunities because they feel like traps',
      'Cynicism about anything that says it wants to help'
    ],
    doors: [
      { type: 'awareness', action: 'Your distrust is earned. It is rational. But it can also keep you from the tools that could change things.' },
      { type: 'transparency', action: 'Helix shows you everything. Open source. Auditable. CRITICAL.md governs every action. Read it yourself.' },
      { type: 'small_steps', action: 'You do not have to trust the whole system. Try one thing. Paper trading. One lesson. See if it delivers.' },
      { type: 'control', action: 'You are always the final authority. The human always wins. That is Rule 10.' }
    ]
  }
};

class CycleBreaker {
  constructor() {
    this.cycles = CYCLES;
  }

  // List all cycles
  listCycles() {
    return Object.entries(this.cycles).map(([key, cycle]) => ({
      id: key,
      name: cycle.name,
      pattern: cycle.pattern
    }));
  }

  // Get a specific cycle with full detail
  getCycle(cycleId) {
    const cycle = this.cycles[cycleId];
    if (!cycle) return null;
    return { id: cycleId, ...cycle };
  }

  // Check which cycles might resonate based on user input
  // This is pattern matching not diagnosis — CRITICAL Rule 8
  identifyPatterns(userSituation) {
    const situation = userSituation.toLowerCase();
    const matches = [];

    const keywords = {
      work_life_trap: ['tired', 'exhausted', 'no time', 'work', 'burnout', 'no energy', 'overtime', 'no life'],
      generational_settling: ['family', 'parents', 'never had', 'no one showed', 'realistic', 'settle', 'stuck', 'generation'],
      absent_parent_cycle: ['father', 'mother', 'absent', 'grew up without', 'kids', 'parent', 'not there'],
      information_desert: ['no access', 'language', 'internet', 'cannot afford', 'dont understand', 'left behind', 'technology'],
      comparison_trap: ['social media', 'behind', 'compare', 'everyone else', 'not enough', 'instagram', 'successful'],
      system_distrust: ['scam', 'trust', 'burned', 'dont believe', 'system', 'corrupt', 'banks', 'government']
    };

    for (const [cycleId, words] of Object.entries(keywords)) {
      const matchCount = words.filter(w => situation.includes(w)).length;
      if (matchCount > 0) {
        matches.push({
          cycleId,
          name: this.cycles[cycleId].name,
          relevance: matchCount,
          pattern: this.cycles[cycleId].pattern
        });
      }
    }

    matches.sort((a, b) => b.relevance - a.relevance);

    return {
      disclaimer: 'This is pattern recognition, not diagnosis. Helix educates. The human decides.',
      patterns: matches,
      note: matches.length === 0
        ? 'Tell me more about where you are. I am listening.'
        : `I see ${matches.length} pattern${matches.length > 1 ? 's' : ''} that might resonate. You decide if they fit.`
    };
  }

  // Get the doors for a specific cycle
  getDoors(cycleId) {
    const cycle = this.cycles[cycleId];
    if (!cycle) return null;
    return {
      cycle: cycle.name,
      doors: cycle.doors,
      reminder: 'These are starting points, not prescriptions. You choose which door to open.'
    };
  }
}

module.exports = CycleBreaker;
