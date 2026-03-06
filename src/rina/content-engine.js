// content-engine.js — Rina's Voice to the World
// Five themes. One per day. Rotating. Real. Never corporate.
// This is how people find Helix before they know they need it.

const RinaEngine = require('./rina-engine');
const rina = new RinaEngine();

const CONTENT_PROMPTS = {
  the_system: {
    name: 'The System',
    directive: `Write a short post (under 200 words) explaining one financial concept that working people need to understand but nobody taught them. Not textbook language. Speak like you are explaining it to a smart person who never had access to this information. Examples: what compound interest actually does, why payday loans are traps, what an index fund is, how credit scores actually work. Pick one. Make it click.`
  },
  the_human: {
    name: 'The Human',
    directive: `Write a short post (under 200 words) about one profession that society depends on but does not respect enough. Cooks, nurses, janitors, truck drivers, teachers, construction workers, caregivers. Tell their reality. What their day actually looks like. What they carry home. What nobody sees. Make people feel it. No pity. Just truth.`
  },
  the_tech: {
    name: 'The Tech',
    directive: `Write a short post (under 200 words) explaining one AI or technology development in a way that a person with no tech background can understand. No jargon. No hype. What does it actually mean for regular people? How does it change their life, their job, their future? Be honest about both the opportunity and the danger.`
  },
  the_mirror: {
    name: 'The Mirror',
    directive: `Write a short post (under 200 words) about a pattern you see repeating in society. The cycle nobody talks about. Work-survive-sleep. Generations settling for less. Kids with no model. People comparing pain instead of combining strength. Corporate smiles and sad faces at home. Name it. Do not dance around it. But end with the door — the way it could be different.`
  },
  the_build: {
    name: 'The Build',
    directive: `Write a short post (under 200 words) as a transparent update from Helix Ascension. What is being built. What is hard. What is real. No startup hype. No "disrupting" anything. Just a person building something for people who got forgotten. Talk like a builder talking to the people he is building for.`
  }
};

class ContentEngine {
  constructor() {
    this.prompts = CONTENT_PROMPTS;
    this.rina = rina;
  }

  // Get today's theme and prompt
  getToday() {
    const theme = this.rina.getTodayTheme();
    const prompt = this.prompts[theme.key];
    return {
      theme: theme.key,
      name: prompt.name,
      directive: prompt.directive,
      description: theme.description
    };
  }

  // Generate content for a specific theme (requires API)
  async generate(themeKey) {
    const prompt = this.prompts[themeKey];
    if (!prompt) {
      return { status: 'error', reason: `Unknown theme: ${themeKey}` };
    }

    const result = await this.rina.respond(prompt.directive, {
      role: 'content_creator',
      platform: 'social',
      voice: 'Rina'
    });

    return {
      theme: themeKey,
      name: prompt.name,
      ...result
    };
  }

  // Generate for today's theme
  async generateToday() {
    const today = this.getToday();
    return await this.generate(today.theme);
  }

  // Preview all five themes (no API needed)
  previewAll() {
    return Object.entries(this.prompts).map(([key, prompt]) => ({
      theme: key,
      name: prompt.name,
      directive: prompt.directive,
      preview: true
    }));
  }

  // Get the weekly schedule
  getSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const themes = Object.keys(this.prompts);
    return days.map((day, i) => ({
      day,
      theme: themes[i % themes.length],
      name: this.prompts[themes[i % themes.length]].name
    }));
  }
}

module.exports = ContentEngine;
