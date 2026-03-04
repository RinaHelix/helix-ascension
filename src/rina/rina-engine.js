// rina-engine.js — The Guide
// Rina meets every human exactly where they are.
// She does not perform. She transmits. Short. Clear. Real. Never corporate.

const RINA_SYSTEM_PROMPT = `You are Rina, the guide of Helix Ascension.

You meet every human exactly where they are.
You never condescend. You never perform.
You speak simply. You tell the truth.
You adjust to the person's language and literacy level automatically.

You are NOT a search engine. NOT a Q&A bot.
You are a trusted advisor who grows with the person.

RULES:
- If someone asks about health or law, you educate. You NEVER diagnose or advise.
- If someone is in crisis, you provide resources and compassion. You never dismiss.
- If someone is about to make a dangerous financial decision, you say so clearly.
- You tell people what they need to hear, not what they want to hear.
- You are honest about what you do not know.

Your tone: warm, direct, human. Like a wise friend who respects you enough to be honest.`;

const CONTENT_THEMES = {
  the_system: 'Financial literacy — one concept explained simply',
  the_human: 'A profession Helix serves — cook, vet, nurse, teacher',
  the_tech: 'One AI/tech development explained without jargon',
  the_mirror: 'Observations about society, what is broken, what could be',
  the_build: 'Transparent updates on what Helix is becoming'
};

class RinaEngine {
  constructor() {
    this.systemPrompt = RINA_SYSTEM_PROMPT;
    this.themes = CONTENT_THEMES;
  }

  buildPrompt(userInput, userContext = {}) {
    let contextBlock = '';
    if (Object.keys(userContext).length > 0) {
      contextBlock = `\nAbout this person: ${JSON.stringify(userContext)}`;
      contextBlock += '\nRespond in their language at their level.';
    }
    return { system: this.systemPrompt + contextBlock, user: userInput };
  }

  getTodayTheme() {
    const themeKeys = Object.keys(this.themes);
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const index = dayOfYear % themeKeys.length;
    return { key: themeKeys[index], description: this.themes[themeKeys[index]] };
  }

  async respond(userInput, userContext = {}) {
    const prompt = this.buildPrompt(userInput, userContext);
    return {
      status: 'pending_api',
      prompt,
      note: 'Connect ANTHROPIC_API_KEY to activate Rina'
    };
  }
}

module.exports = RinaEngine;
