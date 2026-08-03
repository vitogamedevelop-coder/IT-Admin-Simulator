require('dotenv').config({ quiet: true });
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const seed = require('./data/seed');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const dbPath = path.join(dataDir, 'cyberlearn.db');
const db = new sqlite3.Database(dbPath);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

async function init() {
  await run('PRAGMA foreign_keys = ON');
  await run('PRAGMA journal_mode = WAL');
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    xp INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Script-Kiddie',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    added_by TEXT DEFAULT 'owner'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    icon TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    type TEXT DEFAULT 'mcq',
    question TEXT NOT NULL,
    options TEXT,
    answer TEXT NOT NULL,
    explanation TEXT,
    diagnostic TEXT,
    difficulty INTEGER DEFAULT 2,
    FOREIGN KEY (module_id) REFERENCES modules(id)
  )`);
  try {
    await run('ALTER TABLE questions ADD COLUMN difficulty INTEGER DEFAULT 2');
  } catch {
    // Spalte existiert bereits
  }

  await run(`CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS patch_center (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    diagnostic TEXT,
    resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS custom_flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    next_review DATETIME DEFAULT CURRENT_TIMESTAMP,
    bucket INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS custom_fillblanks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    hidden TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS custom_mnemonics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fact TEXT NOT NULL,
    hook TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS cheat_sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    syntax TEXT NOT NULL,
    tags TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS xp_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS daily_challenge_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_date TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    UNIQUE(user_id, challenge_date)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS user_streaks (
    user_id INTEGER PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await run('CREATE INDEX IF NOT EXISTS idx_user_answers_user_question ON user_answers(user_id, question_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_user_progress_user_module ON user_progress(user_id, module_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_xp_log_user_created ON xp_log(user_id, created_at)');
  await run('CREATE INDEX IF NOT EXISTS idx_patch_center_user_resolved ON patch_center(user_id, resolved)');

  const owner = await get("SELECT id FROM users WHERE username = 'admin'");
  if (!owner) {
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!initialPassword || initialPassword.length < 12) throw new Error('ADMIN_INITIAL_PASSWORD mit mindestens 12 Zeichen ist für die Ersteinrichtung erforderlich.');
    const hash = bcrypt.hashSync(initialPassword, 12);
    await run('INSERT INTO users (username, password_hash, role, xp, rank) VALUES (?, ?, ?, ?, ?)', [
      'admin', hash, 'owner', 0, 'SecOps-Spezialist',
    ]);
    await run('INSERT OR IGNORE INTO whitelist (username, added_by) VALUES (?, ?)', ['admin', 'owner']);
    for (const username of (process.env.INITIAL_WHITELIST || '').split(',').map((name) => name.trim()).filter(Boolean)) {
      await run('INSERT OR IGNORE INTO whitelist (username, added_by) VALUES (?, ?)', [username, 'owner']);
    }
  }

  const modCount = await get('SELECT COUNT(*) as c FROM modules');
  if (!modCount || modCount.c === 0) {
    for (const m of seed.modules) {
      const mod = await run(
        'INSERT INTO modules (faculty_id, order_index, title, description, content, icon) VALUES (?, ?, ?, ?, ?, ?)',
        [m.faculty_id, m.order_index, m.title, m.description, JSON.stringify(m.content), m.icon]
      );
      for (const q of m.questions || []) {
        await run(
          'INSERT INTO questions (module_id, type, question, options, answer, explanation, diagnostic, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [mod.id, q.type || 'mcq', q.question, JSON.stringify(q.options || []), q.answer, q.explanation, q.diagnostic, q.difficulty || 2]
        );
      }
    }
    for (const c of seed.cheats || []) {
      await run('INSERT INTO cheat_sheets (category, title, syntax, tags) VALUES (?, ?, ?, ?)', [
        c.category, c.title, c.syntax, JSON.stringify(c.tags || []),
      ]);
    }
  }
}

const initPromise = init();

module.exports = { db, all, get, run, initPromise };
