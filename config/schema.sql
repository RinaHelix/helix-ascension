-- schema.sql — Helix Ascension Database Schema
-- PostgreSQL — reliable, free, handles everything
-- Run: psql -d helix_ascension -f config/schema.sql

-- Governor action log (CRITICAL Rule 3: every decision logged)
CREATE TABLE IF NOT EXISTS governor_log (
  id            SERIAL PRIMARY KEY,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type          VARCHAR(50) NOT NULL,
  bot_name      VARCHAR(100) NOT NULL,
  action        VARCHAR(100),
  params        JSONB,
  result        JSONB,
  human_approved BOOLEAN DEFAULT FALSE,
  dry_run       BOOLEAN DEFAULT TRUE
);

-- Registered bots (CRITICAL Rule 2: one bot = one job)
CREATE TABLE IF NOT EXISTS bots (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) UNIQUE NOT NULL,
  job           VARCHAR(255) NOT NULL,
  allowed_actions TEXT[] NOT NULL,
  active        BOOLEAN DEFAULT TRUE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users — every person deserves dignity
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  display_name  VARCHAR(255),
  language      VARCHAR(10) DEFAULT 'en',
  literacy_level VARCHAR(20) DEFAULT 'standard',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active   TIMESTAMPTZ
);

-- User profiles — the MySpace principle (craft over vanity)
CREATE TABLE IF NOT EXISTS profiles (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id),
  craft         VARCHAR(255),
  bio           TEXT,
  music_url     VARCHAR(500),
  theme         JSONB DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paper trades (CRITICAL Rule 9: paper trading default)
CREATE TABLE IF NOT EXISTS paper_trades (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  ticker        VARCHAR(10) NOT NULL,
  side          VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity      DECIMAL NOT NULL,
  entry_price   DECIMAL NOT NULL,
  stop_loss     DECIMAL NOT NULL,
  status        VARCHAR(20) DEFAULT 'open',
  paper_mode    BOOLEAN DEFAULT TRUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at     TIMESTAMPTZ
);

-- Rina conversations
CREATE TABLE IF NOT EXISTS rina_conversations (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  user_input    TEXT NOT NULL,
  rina_response TEXT NOT NULL,
  context       JSONB DEFAULT '{}',
  helpful       BOOLEAN,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Module progress
CREATE TABLE IF NOT EXISTS module_progress (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  module_name   VARCHAR(100) NOT NULL,
  lesson_id     VARCHAR(100) NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  score         INTEGER,
  completed_at  TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_governor_log_bot ON governor_log(bot_name);
CREATE INDEX IF NOT EXISTS idx_governor_log_time ON governor_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_paper_trades_user ON paper_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_rina_conv_user ON rina_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user ON module_progress(user_id, module_name);
