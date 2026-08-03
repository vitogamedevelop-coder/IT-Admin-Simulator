const express = require('express');
const { all } = require('../db');
const { requireAuth } = require('./auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { search, category } = req.query || {};
  let sql = 'SELECT * FROM cheat_sheets WHERE 1=1';
  const params = [];
  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR syntax LIKE ? OR tags LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY category, title';
  const rows = await all(sql, params);
  res.json(rows.map((r) => ({ ...r, tags: JSON.parse(r.tags || '[]') })));
});

router.get('/categories', requireAuth, async (req, res) => {
  const rows = await all('SELECT DISTINCT category FROM cheat_sheets ORDER BY category');
  res.json(rows.map((r) => r.category));
});

module.exports = router;
