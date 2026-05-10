const express = require('express');
const { queryAll, queryOne, run } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

// GET all my projects
router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;
  const projects = queryAll(`
    SELECT DISTINCT p.*, u.name as owner_name
    FROM projects p
    JOIN users u ON p.owner_id = u.id
    LEFT JOIN project_members pm ON p.id = pm.project_id
    WHERE p.owner_id = ? OR pm.user_id = ?
    ORDER BY p.created_at DESC
  `, [userId, userId]);
  res.json(projects);
});

// GET single project
router.get('/:id', authenticate, (req, res) => {
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  const members = queryAll(`
    SELECT u.id, u.name, u.email, pm.role
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `, [req.params.id]);

  res.json({ ...project, members });
});

// CREATE project
router.post('/', authenticate, (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  if (!name) return res.status(400).json({ error: 'Project name is required.' });

  const result = run(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
    [name, description || '', userId]
  );

  run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [result.lastInsertRowid, userId, 'admin']);

  const newProject = queryOne('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json({ message: 'Project created!', project: newProject });
});

// UPDATE project
router.put('/:id', authenticate, (req, res) => {
  const { name, description } = req.body;
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  if (project.owner_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only the project owner can edit this.' });

  run('UPDATE projects SET name = ?, description = ? WHERE id = ?',
    [name || project.name, description || project.description, req.params.id]);
  res.json({ message: 'Project updated!' });
});

// DELETE project
router.delete('/:id', authenticate, (req, res) => {
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  if (project.owner_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only the owner can delete this project.' });

  run('DELETE FROM tasks WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM project_members WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM projects WHERE id = ?', [req.params.id]);
  res.json({ message: 'Project deleted!' });
});

// ADD member
router.post('/:id/members', authenticate, (req, res) => {
  const { userId: memberUserId, role } = req.body;
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  if (project.owner_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Permission denied.' });

  const user = queryOne('SELECT id, name FROM users WHERE id = ?', [memberUserId]);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const existing = queryOne(
    'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
    [req.params.id, memberUserId]
  );
  if (existing) return res.status(400).json({ error: 'User is already in this project.' });

  run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [req.params.id, memberUserId, role || 'member']);
  res.json({ message: `${user.name} added to project!` });
});

module.exports = router;
