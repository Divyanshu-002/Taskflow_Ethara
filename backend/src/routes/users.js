const express = require('express');
const { queryAll, queryOne } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const users = queryAll('SELECT id, name, email, role FROM users');
  res.json(users);
});

router.get('/me', authenticate, (req, res) => {
  const user = queryOne('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

module.exports = router;
