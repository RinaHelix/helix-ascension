// users.js — User system
// Every person deserves dignity. Craft over vanity.
// No follower counts. No algorithm optimization. Just people.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/helix_ascension'
});

const users = {
  // Create a new user — everyone starts equal
  async create({ displayName, language, literacyLevel }) {
    const result = await pool.query(
      `INSERT INTO users (display_name, language, literacy_level, last_active)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, display_name, language, literacy_level, created_at`,
      [displayName || 'Anonymous', language || 'en', literacyLevel || 'standard']
    );
    return result.rows[0];
  },

  // Get user by ID
  async getById(id) {
    const result = await pool.query(
      `SELECT id, display_name, language, literacy_level, created_at, last_active
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Update last active
  async touch(id) {
    await pool.query(
      `UPDATE users SET last_active = NOW() WHERE id = $1`,
      [id]
    );
  },

  // Create or update profile — the MySpace principle
  async setProfile(userId, { craft, bio, musicUrl, theme }) {
    const result = await pool.query(
      `INSERT INTO profiles (user_id, craft, bio, music_url, theme, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         craft = COALESCE($2, profiles.craft),
         bio = COALESCE($3, profiles.bio),
         music_url = COALESCE($4, profiles.music_url),
         theme = COALESCE($5, profiles.theme),
         updated_at = NOW()
       RETURNING *`,
      [userId, craft || null, bio || null, musicUrl || null, theme || '{}']
    );
    return result.rows[0];
  },

  // Get full profile — user + profile combined
  async getProfile(userId) {
    const result = await pool.query(
      `SELECT u.id, u.display_name, u.language, u.literacy_level, u.created_at,
              p.craft, p.bio, p.music_url, p.theme
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  // List all users (admin/debug)
  async listAll() {
    const result = await pool.query(
      `SELECT u.id, u.display_name, u.language, p.craft
       FROM users u LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  }
};

module.exports = users;
