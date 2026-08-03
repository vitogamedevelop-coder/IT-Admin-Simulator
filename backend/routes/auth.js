const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { get, run } = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRY = '7d';
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Zu viele Anmeldeversuche. Bitte versuche es später erneut.' } });

function validUsername(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{3,30}$/.test(value);
}

function validPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

function createToken(user) {
  return jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

router.post('/register', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!validUsername(username) || !validPassword(password)) return res.status(400).json({ error: 'Benutzername muss 3–30 gültige Zeichen haben; Passwort mindestens 8 Zeichen.' });
  const normalizedUsername = username.trim().toLowerCase();
  const listed = await get('SELECT id FROM whitelist WHERE lower(username) = ?', [normalizedUsername]);
  if (!listed) return res.status(403).json({ error: 'Benutzer ist nicht auf der Whitelist' });
  const existing = await get('SELECT id FROM users WHERE lower(username) = ?', [normalizedUsername]);
  if (existing) return res.status(409).json({ error: 'Benutzer existiert bereits' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [normalizedUsername, passwordHash, 'user']);
  res.status(201).json({ token: createToken({ id: user.id, username: normalizedUsername, role: 'user' }), user: { id: user.id, username: normalizedUsername, role: 'user', xp: 0, rank: 'Script-Kiddie' } });
});

router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
  const user = await get('SELECT * FROM users WHERE lower(username) = ?', [username.trim().toLowerCase()]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  res.json({ token: createToken(user), user: { id: user.id, username: user.username, role: user.role, xp: user.xp, rank: user.rank } });
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Nicht authentifiziert' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
}

router.get('/me', requireAuth, async (req, res) => {
  const user = await get('SELECT id, username, role, xp, rank FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  res.json(user);
});

module.exports = { router, requireAuth };
