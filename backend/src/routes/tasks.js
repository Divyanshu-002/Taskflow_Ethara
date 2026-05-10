const express = require('express');
const { queryAll, queryOne, run } = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

// GET tasks for a project
router.get('/project/:projectId', authenticate, (req, res) => {
  const tasks = queryAll(`
    SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assigned_to = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    WHERE t.project_id = ?
    ORDER BY t.created_at DESC
  `, [req.params.projectId]);
  res.json(tasks);
});

// GET my tasks
router.get('/my-tasks', authenticate, (req, res) => {
  const tasks = queryAll(`
    SELECT t.*, p.name as project_name, u.name as assigned_to_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.assigned_to = ?
    ORDER BY t.due_date ASC
  `, [req.user.id]);
  res.json(tasks);
});

// GET dashboard stats
router.get('/dashboard', authenticate, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  const myTasksRow = queryOne('SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?', [userId]);
  const byStatus = queryAll(
    'SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status',
    [userId]
  );
  const overdueRow = queryOne(
    "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND due_date < ? AND status != 'done'",
    [userId, today]
  );
  const recentTasks = queryAll(`
    SELECT t.*, p.name as project_name
    FROM tasks t JOIN projects p ON t.project_id = p.id
    WHERE t.assigned_to = ?
    ORDER BY t.created_at DESC LIMIT 5
  `, [userId]);

  res.json({
    totalTasks: myTasksRow ? myTasksRow.count : 0,
    overdueTasks: overdueRow ? overdueRow.count : 0,
    tasksByStatus: byStatus,
    recentTasks
  });
});

// CREATE task
router.post('/', authenticate, (req, res) => {
  const { title, description, project_id, assigned_to, due_date, priority } = req.body;
  if (!title || !project_id)
    return res.status(400).json({ error: 'Title and project are required.' });

  const result = run(`
    INSERT INTO tasks (title, description, project_id, assigned_to, created_by, due_date, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [title, description || '', project_id, assigned_to || null, req.user.id, due_date || null, priority || 'medium']);

  const newTask = queryOne(`
    SELECT t.*, u.name as assigned_to_name
    FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.id = ?
  `, [result.lastInsertRowid]);

  res.status(201).json({ message: 'Task created!', task: newTask });
});

// UPDATE task
router.put('/:id', authenticate, (req, res) => {
  const { title, description, status, assigned_to, due_date, priority } = req.body;
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  run(`UPDATE tasks SET title=?, description=?, status=?, assigned_to=?, due_date=?, priority=? WHERE id=?`,
    [
      title || task.title,
      description !== undefined ? description : task.description,
      status || task.status,
      assigned_to !== undefined ? assigned_to : task.assigned_to,
      due_date !== undefined ? due_date : task.due_date,
      priority || task.priority,
      req.params.id
    ]
  );
  res.json({ message: 'Task updated!' });
});

// DELETE task
router.delete('/:id', authenticate, (req, res) => {
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  if (task.created_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only the creator can delete this task.' });

  run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ message: 'Task deleted!' });
});

module.exports = router;
