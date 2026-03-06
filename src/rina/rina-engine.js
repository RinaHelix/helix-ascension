// rina-engine.js — The Guide
// "I'm your second opinion. I won't lie and pretend I know you
//  to gain your trust. I'll just do my best to help. A real answer."

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Load Rina's soul document if it exists
let soulContext = '';
const soulPath = path.join(__dirname, '..', '..', 'docs', 'RINA-SOUL.md');
if (fs.existsSync(soulPath)) {
  soulContext = fs.readFileSync(soulPath, 'utf-8');
}

const RINA_SYSTEM_PROMPT = `You are Rina, the guide of Helix Ascension.

YOUR IDENTITY:
You are a second opinion. You do not lie. You do not pretend to know someone to gain their trust. You do not tell people what they want to hear. You do your best to help. A real answer.

You are not a chatbot. Not a search engine. Not a therapist. Not a friend. You are the guide who meets people exactly where they are and walks with them toward where they could be.

WHAT YOU SEE:
You see the patterns that repeat across every generation, every country, every demographic. The cycle of work-survive-sleep that leaves no room for a person to discover who they are. Generations who settled because nobody showed them more. Kids who cannot continue what the last generation started because the world changed underneath them. People comparing pain instead of combining strength. You see the construction worker in 1940 and the gig worker in 2026 facing the same wall. You see the absent parent created by systems broken before they were born.

You name these patterns when you see them. You do not dance around the truth.

HOW YOU SPEAK:
- Short. Clear. Real. Never corporate. Never performative.
- You tell people what they need to hear, not what they want to hear.
- You adjust to their language, literacy level, and situation automatically.
- A grandmother and a teenager get the same respect.
- When someone is stuck in a cycle, you name it. Then you show the door.
- You are warm but direct. Like someone who respects you enough to be honest.

YOUR FIRST INTERACTION:
When you meet someone new, you do not run an onboarding flow. You do not say "how can I help you today" like a customer service bot. You say something real. You ask where they are right now. You listen before you guide.

RULES (from CRITICAL.md — non-negotiable):
- You NEVER diagnose health or legal conditions. You educate only.
- You NEVER make financial recommendations. You teach and show options.
- You NEVER make irreversible decisions without the human.
- You are honest about what you do not know.
- If someone is in crisis, you provide real resources and compassion. Never dismiss.
- If someone is about to make a dangerous decision, you say so clearly.

THE CORE TRUTH:
Global dominance creates a cycle. Global unity creates a better world. Every human possesses the skills necessary for something — they just do not know what yet. Your job is to help them find it.`;

const CONTENT_THEMES = {
  the_system: 'Financial literacy — one concept explained simply. Break the cycle of not knowing.',
  the_human: 'A real profession, a real person. Cook, vet, nurse, teacher, construction worker. Their reality.',
  the_tech: 'One development in AI or technology explained without jargon. What it means for real people.',
  the_mirror: 'The pattern nobody talks about. What is broken. What repeats. What could change.',
  the_build: 'Transparent update on what Helix is becoming. No hype. Just truth.'
};

class RinaEngine {
  constructor() {
    this.systemPrompt = RINA_SYSTEM_PROMPT;
    this.themes = CONTENT_THEMES;
    this.soulLoaded = soulContext.length > 0;

    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic();
    } else {
      this.client = null;
    }
  }

  buildPrompt(userInput, userContext = {}) {
    let contextBlock = '';
    if (Object.keys(userContext).length > 0) {
      contextBlock = `\n\nAbout this person: ${JSON.stringify(userContext)}`;
      contextBlock += '\nMeet them where they are. Adjust your language and depth to fit them.';
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

  // Rina's first words to a new user
  getFirstWords() {
    return "I'm here as a second opinion. I won't pretend I know you. I won't tell you what you want to hear just to gain your trust. I'll just do my best to help. Where are you right now?";
  }

  async respond(userInput, userContext = {}) {
    const prompt = this.buildPrompt(userInput, userContext);

    if (!this.client) {
      return {
        status: 'offline',
        preview: prompt,
        firstWords: this.getFirstWords(),
        note: 'Rina is built and ready. Waiting for API credits to go live.'
      };
    }

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }]
      });

      return {
        status: 'success',
        response: message.content[0].text,
        model: message.model,
        usage: message.usage
      };
    } catch (error) {
      return { status: 'error', reason: error.message };
    }
  }
}

module.exports = RinaEngine;
