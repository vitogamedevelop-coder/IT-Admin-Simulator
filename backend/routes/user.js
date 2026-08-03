const express = require('express');
const bcrypt = require('bcryptjs');
const { all, get, run } = require('../db');
const { requireAuth } = require('./auth');
const { addXp } = require('./modules');
const { createBackup, listBackups } = require('../backup');
const router = express.Router();

function requireManager(req, res) {
  if (req.role === 'owner' || req.role === 'admin') return true;
  res.status(403).json({ error: 'Verboten' });
  return false;
}

function dateOffset(days) { const date = new Date(); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }

async function checkIn(userId) {
  const today = dateOffset(0);
  const row = await get('SELECT * FROM user_streaks WHERE user_id = ?', [userId]);
  if (row?.last_activity_date === today) return row;
  const current = row?.last_activity_date === dateOffset(-1) ? row.current_streak + 1 : 1;
  const longest = Math.max(current, row?.longest_streak || 0);
  await run('INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET current_streak = excluded.current_streak, longest_streak = excluded.longest_streak, last_activity_date = excluded.last_activity_date', [userId, current, longest, today]);
  return { user_id: userId, current_streak: current, longest_streak: longest, last_activity_date: today };
}

router.get('/profile', requireAuth, async (req, res) => {
  const user = await get('SELECT id, username, role, xp, rank FROM users WHERE id = ?', [req.userId]);
  const xpLog = await all('SELECT amount, reason, created_at FROM xp_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.userId]);
  const streak = await checkIn(req.userId);
  res.json({ user, xpLog, streak });
});
router.get('/streak', requireAuth, async (req, res) => res.json(await checkIn(req.userId)));

router.post('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) return res.status(400).json({ error: 'Das neue Passwort muss 8–128 Zeichen haben.' });
  const user = await get('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) return res.status(400).json({ error: 'Das aktuelle Passwort ist nicht korrekt.' });
  await run('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 12), req.userId]);
  res.json({ ok: true });
});

router.get('/export', requireAuth, async (req, res) => {
  const [flashcards, fillblanks, mnemonics] = await Promise.all([
    all('SELECT front, back, next_review, bucket FROM custom_flashcards WHERE user_id = ?', [req.userId]),
    all('SELECT title, text, hidden FROM custom_fillblanks WHERE user_id = ?', [req.userId]),
    all('SELECT fact, hook FROM custom_mnemonics WHERE user_id = ?', [req.userId]),
  ]);
  res.json({ version: 1, exportedAt: new Date().toISOString(), flashcards, fillblanks, mnemonics });
});

router.post('/import', requireAuth, async (req, res) => {
  const payload = req.body || {};
  const cards = Array.isArray(payload.flashcards) ? payload.flashcards.slice(0, 500) : [];
  const blanks = Array.isArray(payload.fillblanks) ? payload.fillblanks.slice(0, 200) : [];
  const mnemonics = Array.isArray(payload.mnemonics) ? payload.mnemonics.slice(0, 500) : [];
  for (const item of cards) if (typeof item.front === 'string' && typeof item.back === 'string' && item.front.length <= 1000 && item.back.length <= 1000) await run('INSERT INTO custom_flashcards (user_id, front, back, next_review, bucket) VALUES (?, ?, ?, ?, ?)', [req.userId, item.front, item.back, item.next_review || new Date().toISOString(), Number(item.bucket) || 1]);
  for (const item of blanks) if (typeof item.title === 'string' && typeof item.text === 'string') await run('INSERT INTO custom_fillblanks (user_id, title, text, hidden) VALUES (?, ?, ?, ?)', [req.userId, item.title.slice(0, 200), item.text.slice(0, 10000), JSON.stringify(Array.isArray(item.hidden) ? item.hidden : [])]);
  for (const item of mnemonics) if (typeof item.fact === 'string' && typeof item.hook === 'string') await run('INSERT INTO custom_mnemonics (user_id, fact, hook) VALUES (?, ?, ?)', [req.userId, item.fact.slice(0, 1000), item.hook.slice(0, 1000)]);
  res.json({ ok: true, imported: { flashcards: cards.length, fillblanks: blanks.length, mnemonics: mnemonics.length } });
});

router.get('/leaderboard', requireAuth, async (req, res) => res.json(await all('SELECT username, xp, rank FROM users ORDER BY xp DESC LIMIT 10')));
router.get('/stats', requireAuth, async (req, res) => {
  const totals = await get('SELECT COUNT(*) AS attempts, COALESCE(SUM(correct), 0) AS correct, COUNT(DISTINCT question_id) AS unique_questions FROM user_answers WHERE user_id = ?', [req.userId]);
  const modules = await all('SELECT m.title, m.faculty_id, p.score, p.completed FROM user_progress p JOIN modules m ON m.id = p.module_id WHERE p.user_id = ? ORDER BY m.faculty_id, m.order_index', [req.userId]);
  const days = await all('SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS attempts, SUM(correct) AS correct FROM user_answers WHERE user_id = ? GROUP BY substr(created_at, 1, 10) ORDER BY date DESC LIMIT 28', [req.userId]);
  res.json({ totals, modules, days });
});

router.get('/daily-challenge', requireAuth, async (req, res) => {
  const questions = await all('SELECT id, module_id, question, options FROM questions ORDER BY id');
  if (!questions.length) return res.status(404).json({ error: 'Keine Tageschallenge verfügbar' });
  const date = dateOffset(0); const question = questions[Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000) % questions.length];
  const completed = await get('SELECT id FROM daily_challenge_completions WHERE user_id = ? AND challenge_date = ?', [req.userId, date]);
  res.json({ date, completed: Boolean(completed), question: { ...question, options: JSON.parse(question.options || '[]') } });
});
router.post('/daily-challenge', requireAuth, async (req, res) => {
  const date = dateOffset(0); const questions = await all('SELECT id, answer FROM questions ORDER BY id'); const question = questions[Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000) % questions.length];
  const existing = await get('SELECT id FROM daily_challenge_completions WHERE user_id = ? AND challenge_date = ?', [req.userId, date]);
  if (existing) return res.status(409).json({ error: 'Die Tageschallenge wurde bereits gelöst.' });
  if (String(req.body?.answer || '').trim().toLowerCase() !== String(question.answer).trim().toLowerCase()) return res.json({ correct: false });
  await run('INSERT INTO daily_challenge_completions (user_id, challenge_date, question_id) VALUES (?, ?, ?)', [req.userId, date, question.id]);
  const xp = await addXp(req.userId, 25, 'Tageschallenge abgeschlossen');
  const streak = await checkIn(req.userId);
  res.json({ correct: true, xp, streak });
});

router.get('/whitelist', requireAuth, async (req, res) => { if (requireManager(req, res)) res.json(await all('SELECT * FROM whitelist ORDER BY username')); });
router.post('/whitelist', requireAuth, async (req, res) => { if (!requireManager(req, res)) return; const username = String(req.body?.username || '').trim().toLowerCase(); if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) return res.status(400).json({ error: 'Ungültiger Benutzername' }); await run('INSERT OR IGNORE INTO whitelist (username, added_by) VALUES (?, ?)', [username, req.username]); res.json({ ok: true }); });
router.delete('/whitelist/:username', requireAuth, async (req, res) => { if (!requireManager(req, res)) return; if (req.params.username === 'admin') return res.status(400).json({ error: 'Der Besitzerzugang kann nicht entfernt werden.' }); await run('DELETE FROM whitelist WHERE username = ?', [req.params.username]); res.json({ ok: true }); });
router.get('/admin/users', requireAuth, async (req, res) => { if (requireManager(req, res)) res.json(await all('SELECT id, username, role, xp, rank, created_at FROM users ORDER BY created_at DESC')); });
router.post('/admin/users/:id/password', requireAuth, async (req, res) => { if (!requireManager(req, res)) return; const id = Number(req.params.id); const password = req.body?.newPassword; if (!Number.isSafeInteger(id) || typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Ungültige Daten' }); await run('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password, 12), id]); res.json({ ok: true }); });
router.get('/admin/backups', requireAuth, async (req, res) => { if (requireManager(req, res)) res.json(await listBackups()); });
router.post('/admin/backups', requireAuth, async (req, res) => { if (requireManager(req, res)) res.json({ file: await createBackup() }); });

module.exports = router;
