// frequency-games.js — The Frequency Layer
// Not entertainment. Not gamification. Frequency tuning.
// Each game targets a brain state. Backed by real neuroscience.
// Delta: rest. Theta: processing. Alpha: flow. Beta: focus. Gamma: insight.
// CRITICAL Rule 8: Education and wellness, not therapy.

const FREQUENCIES = {
  delta: {
    name: 'Delta — Rest & Restore',
    hz: '0.5-4 Hz',
    state: 'Deep rest, healing, restoration',
    when: 'High stress, burnout, insomnia, after crisis',
    games: [
      {
        id: 'breath-ocean',
        name: 'Ocean Breath',
        description: 'Breathe with the waves. Inhale as the wave rises, exhale as it falls. No timer. No score. Just your breath and the ocean.',
        duration: 'As long as you need',
        mechanic: 'Visual wave synced to 4-7-8 breathing pattern'
      },
      {
        id: 'slow-fall',
        name: 'Slow Fall',
        description: 'A single leaf falling through layers of color. Tap to slow it down. The slower you go, the deeper the calm.',
        duration: '3-5 min',
        mechanic: 'Deceleration reward loop — opposite of every other game'
      }
    ]
  },
  theta: {
    name: 'Theta — Process & Feel',
    hz: '4-8 Hz',
    state: 'Emotional processing, memory, creativity',
    when: 'Working through something, need to process feelings, creative block',
    games: [
      {
        id: 'pattern-river',
        name: 'Pattern River',
        description: 'Shapes flow down a river. Group the ones that feel similar. No right answer. The patterns you see reveal how you think.',
        duration: '5-10 min',
        mechanic: 'Subjective pattern matching — no score, just reflection'
      },
      {
        id: 'color-memory',
        name: 'Color Memory',
        description: 'Colors flash in sequence. Recreate them. As you go deeper, the sequences get longer and the colors get more subtle.',
        duration: '5-10 min',
        mechanic: 'Sequential memory with gradual complexity'
      }
    ]
  },
  alpha: {
    name: 'Alpha — Flow & Create',
    hz: '8-13 Hz',
    state: 'Relaxed focus, creativity, visualization',
    when: 'Need to think clearly, creative work, learning something new',
    games: [
      {
        id: 'sand-draw',
        name: 'Sand Draw',
        description: 'Draw in sand with your finger. The sand responds to pressure and speed. No objective. Just create.',
        duration: 'Open ended',
        mechanic: 'Freeform creative expression with tactile feedback'
      },
      {
        id: 'light-weave',
        name: 'Light Weave',
        description: 'Connect points of light to create constellations. Each connection produces a tone. Build something beautiful.',
        duration: '5-15 min',
        mechanic: 'Spatial creativity with audio feedback'
      }
    ]
  },
  beta: {
    name: 'Beta — Focus & Solve',
    hz: '13-30 Hz',
    state: 'Active cognition, problem solving, attention',
    when: 'Need to concentrate, studying, working, decision making',
    games: [
      {
        id: 'signal-sort',
        name: 'Signal Sort',
        description: 'Data streams flow across screen. Sort real signals from noise. Speed increases. How long can you maintain clarity?',
        duration: '5-10 min',
        mechanic: 'Signal detection with increasing cognitive load'
      },
      {
        id: 'path-finder',
        name: 'Path Finder',
        description: 'Find the efficient path through a shifting maze. The maze evolves as you move. Teaches adaptive problem solving.',
        duration: '5-10 min',
        mechanic: 'Dynamic pathfinding with environmental change'
      }
    ]
  },
  gamma: {
    name: 'Gamma — Insight & Connect',
    hz: '30-100 Hz',
    state: 'High-level pattern matching, insight, perceptual speed',
    when: 'Need breakthrough thinking, connecting ideas across domains',
    games: [
      {
        id: 'cross-link',
        name: 'Cross Link',
        description: 'Concepts from different fields appear. Find the hidden connection between them. A nurse and a coder. A recipe and an algorithm. Everything connects.',
        duration: '5-15 min',
        mechanic: 'Cross-domain pattern recognition'
      },
      {
        id: 'speed-sense',
        name: 'Speed Sense',
        description: 'Images flash for milliseconds. Identify what you saw. Your brain processes more than you think. Train the perception.',
        duration: '3-5 min',
        mechanic: 'Rapid perceptual identification with decreasing exposure time'
      }
    ]
  }
};

class FrequencyGames {
  constructor() {
    this.frequencies = FREQUENCIES;
  }

  listAll() {
    return Object.entries(this.frequencies).map(([key, freq]) => ({
      id: key,
      name: freq.name,
      hz: freq.hz,
      state: freq.state,
      when: freq.when,
      gameCount: freq.games.length
    }));
  }

  getFrequency(freqId) {
    const freq = this.frequencies[freqId];
    if (!freq) return null;
    return { id: freqId, ...freq };
  }

  getGame(freqId, gameId) {
    const freq = this.frequencies[freqId];
    if (!freq) return null;
    const game = freq.games.find(g => g.id === gameId);
    if (!game) return null;
    return { frequency: freqId, frequencyName: freq.name, hz: freq.hz, ...game };
  }

  recommend(situation) {
    const lower = situation.toLowerCase();
    const recommendations = [];

    const keywords = {
      delta: ['stressed', 'tired', 'cant sleep', 'burnout', 'exhausted', 'overwhelmed', 'crisis', 'anxious'],
      theta: ['sad', 'processing', 'grief', 'confused', 'lost', 'emotional', 'memories', 'creative block'],
      alpha: ['thinking', 'creating', 'learning', 'relaxed', 'ideas', 'calm', 'design', 'writing'],
      beta: ['focus', 'studying', 'working', 'concentrate', 'decision', 'problem', 'solving', 'attention'],
      gamma: ['stuck', 'breakthrough', 'connecting', 'insight', 'pattern', 'big picture', 'understand']
    };

    for (const [freqId, words] of Object.entries(keywords)) {
      const matches = words.filter(w => lower.includes(w)).length;
      if (matches > 0) {
        const freq = this.frequencies[freqId];
        recommendations.push({
          frequency: freqId,
          name: freq.name,
          hz: freq.hz,
          relevance: matches,
          games: freq.games.map(g => ({ id: g.id, name: g.name }))
        });
      }
    }

    recommendations.sort((a, b) => b.relevance - a.relevance);

    if (recommendations.length === 0) {
      recommendations.push({
        frequency: 'alpha',
        name: this.frequencies.alpha.name,
        hz: this.frequencies.alpha.hz,
        relevance: 0,
        games: this.frequencies.alpha.games.map(g => ({ id: g.id, name: g.name })),
        note: 'Alpha is a good default — relaxed focus for wherever you are.'
      });
    }

    return {
      disclaimer: 'Frequency games support wellness, not treatment. For clinical needs, see the Safe Place.',
      recommendations
    };
  }
}

module.exports = FrequencyGames;
