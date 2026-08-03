const express = require('express');
const { all, get, run } = require('../db');
const { requireAuth } = require('./auth');
const router = express.Router();

function rankForXp(xp) {
  if (xp >= 5000) return 'SecOps-Spezialist';
  if (xp >= 2500) return 'Netzwerkadmin';
  if (xp >= 1000) return 'Pentester';
  if (xp >= 400) return 'SysAdmin';
  if (xp >= 150) return 'Script-Runner';
  return 'Script-Kiddie';
}

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function addXp(userId, amount, reason) {
  await run('INSERT INTO xp_log (user_id, amount, reason) VALUES (?, ?, ?)', [userId, amount, reason]);
  await run('UPDATE users SET xp = xp + ? WHERE id = ?', [amount, userId]);
  const row = await get('SELECT xp FROM users WHERE id = ?', [userId]);
  const rank = rankForXp(row.xp);
  await run('UPDATE users SET rank = ? WHERE id = ?', [rank, userId]);
  return { xp: row.xp, rank };
}

router.get('/', requireAuth, async (req, res) => {
  const modules = await all(`SELECT * FROM modules ORDER BY CASE faculty_id WHEN 'it' THEN 1 WHEN 'coding' THEN 2 ELSE 3 END, order_index`);
  const progress = await all('SELECT module_id, completed, score FROM user_progress WHERE user_id = ?', [req.userId]);
  const map = new Map(progress.map((item) => [item.module_id, item]));
  res.json(modules.map((module) => {
    const previous = modules.find((item) => item.faculty_id === module.faculty_id && item.order_index === module.order_index - 1);
    const locked = Boolean(previous && !map.get(previous.id)?.completed);
    return { ...module, progress: map.get(module.id) || null, locked };
  }));
});

router.get('/questions', requireAuth, async (req, res) => {
  const facultyId = String(req.query.faculty || '');
  if (!['it', 'coding'].includes(facultyId)) return res.status(400).json({ error: 'Unbekannter Fachbereich' });
  const rows = await all(`SELECT q.id, q.module_id, q.question, q.options, q.answer, q.difficulty FROM questions q JOIN modules m ON m.id = q.module_id WHERE m.faculty_id = ? ORDER BY m.order_index, q.id`, [facultyId]);
  res.json(rows.map((question) => ({ ...question, options: JSON.parse(question.options || '[]') })));
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Ungültige Modul-ID' });
  const module = await get('SELECT * FROM modules WHERE id = ?', [id]);
  if (!module) return res.status(404).json({ error: 'Modul nicht gefunden' });
  const previous = await get('SELECT id FROM modules WHERE faculty_id = ? AND order_index = ?', [module.faculty_id, module.order_index - 1]);
  if (previous && !(await get('SELECT completed FROM user_progress WHERE user_id = ? AND module_id = ? AND completed = 1', [req.userId, previous.id]))) return res.status(403).json({ error: 'Dieses Modul wird nach Abschluss des vorherigen Moduls freigeschaltet.' });
  const questions = await all('SELECT * FROM questions WHERE module_id = ?', [id]);
  const progress = await get('SELECT * FROM user_progress WHERE user_id = ? AND module_id = ?', [req.userId, id]);
  res.json({ ...module, content: JSON.parse(module.content || '{}'), questions, progress });
});

router.post('/:id/answer', requireAuth, async (req, res) => {
  const moduleId = parseId(req.params.id);
  const questionId = parseId(req.body?.questionId);
  const answer = req.body?.answer;
  if (!moduleId || !questionId || typeof answer !== 'string' || answer.length > 500) return res.status(400).json({ error: 'Gültige Modul-ID, Frage und Antwort erforderlich' });
  const question = await get('SELECT * FROM questions WHERE id = ? AND module_id = ?', [questionId, moduleId]);
  if (!question) return res.status(404).json({ error: 'Frage nicht gefunden' });
  const correct = answer.trim().toLowerCase() === String(question.answer).trim().toLowerCase();
  let xpUpdate = null;
  let completed = 0;
  let score = 0;

  try {
    await run('BEGIN IMMEDIATE');
    const alreadyCorrect = await get('SELECT id FROM user_answers WHERE user_id = ? AND question_id = ? AND correct = 1', [req.userId, questionId]);
    const previousProgress = await get('SELECT completed FROM user_progress WHERE user_id = ? AND module_id = ?', [req.userId, moduleId]);
    await run('INSERT INTO user_answers (user_id, question_id, correct) VALUES (?, ?, ?)', [req.userId, questionId, correct ? 1 : 0]);
    if (!correct) await run('INSERT OR REPLACE INTO patch_center (user_id, question_id, diagnostic, resolved) VALUES (?, ?, ?, 0)', [req.userId, questionId, question.diagnostic]);
    if (correct && !alreadyCorrect) xpUpdate = await addXp(req.userId, 10, `Richtige Antwort in Modul ${moduleId}`);
    const total = await get('SELECT COUNT(*) AS count FROM questions WHERE module_id = ?', [moduleId]);
    const answered = await get('SELECT COUNT(DISTINCT question_id) AS count FROM user_answers WHERE user_id = ? AND correct = 1 AND question_id IN (SELECT id FROM questions WHERE module_id = ?)', [req.userId, moduleId]);
    completed = answered.count >= total.count ? 1 : 0;
    score = total.count ? Math.round((answered.count / total.count) * 100) : 0;
    await run('INSERT INTO user_progress (user_id, module_id, completed, score) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, module_id) DO UPDATE SET completed = excluded.completed, score = excluded.score, updated_at = CURRENT_TIMESTAMP', [req.userId, moduleId, completed, score]);
    if (completed && !previousProgress?.completed && xpUpdate) xpUpdate = await addXp(req.userId, 50, `Modul ${moduleId} abgeschlossen`);
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK').catch(() => {});
    throw error;
  }

  res.json({ correct, answer: question.answer, explanation: question.explanation, diagnostic: correct ? null : question.diagnostic, xp: xpUpdate, progress: { completed, score } });
});

router.get('/:id/progress', requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Ungültige Modul-ID' });
  const progress = await get('SELECT * FROM user_progress WHERE user_id = ? AND module_id = ?', [req.userId, id]);
  res.json(progress || { completed: 0, score: 0 });
});

module.exports = { router, addXp };
