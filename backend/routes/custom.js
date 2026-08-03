const express = require('express');
const { all, get, run } = require('../db');
const { requireAuth } = require('./auth');
const router = express.Router();

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Flashcards
router.get('/flashcards', requireAuth, async (req, res) => {
  const due = req.query.due === 'true';
  let sql = 'SELECT * FROM custom_flashcards WHERE user_id = ?';
  const params = [req.userId];
  if (due) {
    sql += ' AND datetime(next_review) <= datetime("now")';
  }
  sql += ' ORDER BY next_review';
  const rows = await all(sql, params);
  res.json(rows);
});

router.post('/flashcards', requireAuth, async (req, res) => {
  const { front, back } = req.body || {};
  if (!front || !back) return res.status(400).json({ error: 'Vorder- und Rückseite erforderlich' });
  const card = await run('INSERT INTO custom_flashcards (user_id, front, back) VALUES (?, ?, ?)', [req.userId, front, back]);
  res.json({ id: card.id, front, back });
});

router.post('/flashcards/:id/review', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { difficulty } = req.body || {};
  const days = difficulty === 'Easy' ? 7 : difficulty === 'Medium' ? 3 : 1;
  const next = addDays(days);
  const bucket = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 2 : 1;
  await run('UPDATE custom_flashcards SET next_review = ?, bucket = ? WHERE id = ? AND user_id = ?', [next, bucket, id, req.userId]);
  res.json({ nextReview: next, difficulty });
});

router.delete('/flashcards/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await run('DELETE FROM custom_flashcards WHERE id = ? AND user_id = ?', [id, req.userId]);
  res.json({ ok: true });
});

// Fill-in-the-blanks
router.get('/fillblanks', requireAuth, async (req, res) => {
  const rows = await all('SELECT id, title, hidden, created_at FROM custom_fillblanks WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
  res.json(rows.map((r) => ({ ...r, hidden: JSON.parse(r.hidden || '[]') })));
});

router.get('/fillblanks/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = await get('SELECT * FROM custom_fillblanks WHERE id = ? AND user_id = ?', [id, req.userId]);
  if (!row) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ ...row, hidden: JSON.parse(row.hidden || '[]') });
});

router.post('/fillblanks', requireAuth, async (req, res) => {
  const { title, text, hidden } = req.body || {};
  if (!title || !text || !Array.isArray(hidden)) return res.status(400).json({ error: 'Titel, Text und hidden-Array erforderlich' });
  const fb = await run('INSERT INTO custom_fillblanks (user_id, title, text, hidden) VALUES (?, ?, ?, ?)', [req.userId, title, text, JSON.stringify(hidden)]);
  res.json({ id: fb.id });
});

router.delete('/fillblanks/:id', requireAuth, async (req, res) => {
  await run('DELETE FROM custom_fillblanks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ ok: true });
});

// Mnemonics
router.get('/mnemonics', requireAuth, async (req, res) => {
  const rows = await all('SELECT * FROM custom_mnemonics WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
  res.json(rows);
});

router.post('/mnemonics', requireAuth, async (req, res) => {
  const { fact, hook } = req.body || {};
  if (!fact || !hook) return res.status(400).json({ error: 'Fakt und Merkhilfe erforderlich' });
  const m = await run('INSERT INTO custom_mnemonics (user_id, fact, hook) VALUES (?, ?, ?)', [req.userId, fact, hook]);
  res.json({ id: m.id, fact, hook });
});

router.delete('/mnemonics/:id', requireAuth, async (req, res) => {
  await run('DELETE FROM custom_mnemonics WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ ok: true });
});

module.exports = router;
