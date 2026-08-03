const express = require('express');
const { all } = require('../db');
const { requireAuth } = require('./auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 80);
  if (query.length < 2) return res.json([]);
  const like = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
  const modules = await all(`SELECT id, title, description, 'module' AS type FROM modules WHERE title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' LIMIT 8`, [like, like]);
  const cheats = await all(`SELECT id, title, syntax AS description, 'cheat' AS type FROM cheat_sheets WHERE title LIKE ? ESCAPE '\\' OR syntax LIKE ? ESCAPE '\\' LIMIT 8`, [like, like]);
  const cards = await all(`SELECT id, front AS title, back AS description, 'karteikarte' AS type FROM custom_flashcards WHERE user_id = ? AND (front LIKE ? ESCAPE '\\' OR back LIKE ? ESCAPE '\\') LIMIT 8`, [req.userId, like, like]);
  const mnemonics = await all(`SELECT id, fact AS title, hook AS description, 'eselsbrücke' AS type FROM custom_mnemonics WHERE user_id = ? AND (fact LIKE ? ESCAPE '\\' OR hook LIKE ? ESCAPE '\\') LIMIT 8`, [req.userId, like, like]);
  res.json([...modules, ...cheats, ...cards, ...mnemonics]);
});

module.exports = router;
