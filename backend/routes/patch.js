const express = require('express');
const { all, get, run } = require('../db');
const { requireAuth } = require('./auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const rows = await all(`SELECT p.id, p.diagnostic, p.resolved, p.question_id, q.question, q.answer, q.explanation, q.options, m.id AS module_id, m.title AS module_title FROM patch_center p JOIN questions q ON p.question_id = q.id JOIN modules m ON q.module_id = m.id WHERE p.user_id = ? ORDER BY p.resolved, p.created_at DESC`, [req.userId]);
  res.json(rows);
});
router.get('/training', requireAuth, async (req, res) => {
  const rows = await all(`SELECT p.id AS patch_id, q.id AS question_id, q.module_id, q.question, q.options, q.answer, q.explanation FROM patch_center p JOIN questions q ON q.id = p.question_id WHERE p.user_id = ? AND p.resolved = 0 ORDER BY p.created_at DESC LIMIT 15`, [req.userId]);
  res.json(rows.map((row) => ({ ...row, options: JSON.parse(row.options || '[]') })));
});
router.post('/:id/retry', requireAuth, async (req, res) => {
  const id = Number(req.params.id); const answer = String(req.body?.answer || '');
  const item = await get(`SELECT p.question_id, q.answer, q.explanation FROM patch_center p JOIN questions q ON q.id = p.question_id WHERE p.id = ? AND p.user_id = ?`, [id, req.userId]);
  if (!item) return res.status(404).json({ error: 'Trainingseintrag nicht gefunden' });
  const correct = answer.trim().toLowerCase() === item.answer.trim().toLowerCase();
  if (correct) await run('UPDATE patch_center SET resolved = 1 WHERE id = ? AND user_id = ?', [id, req.userId]);
  res.json({ correct, answer: item.answer, explanation: item.explanation });
});
router.post('/:id/resolve', requireAuth, async (req, res) => { const id = Number(req.params.id); await run('UPDATE patch_center SET resolved = 1 WHERE id = ? AND user_id = ?', [id, req.userId]); res.json({ ok: true }); });
module.exports = router;
