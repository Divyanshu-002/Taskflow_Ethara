import React, { useState, useEffect } from 'react';
import API from '../api';
import './MyTasks.css';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await API.get('/tasks/my-tasks');
        setTasks(res.data);
      } catch (err) {
        console.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  async function handleStatusChange(taskId, newStatus) {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert('Failed to update.');
    }
  }

  const today = new Date().toISOString().split('T')[0];

  // Filter tasks
  const filtered = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 'todo';
    if (filter === 'in_progress') return task.status === 'in_progress';
    if (filter === 'done') return task.status === 'done';
    if (filter === 'overdue') return task.due_date && task.due_date < today && task.status !== 'done';
    return true;
  });

  if (loading) return <div className="loading">Loading your tasks...</div>;

  return (
    <div className="my-tasks-page">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p>All tasks assigned to you</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="filter-bar">
        {['all', 'todo', 'in_progress', 'done', 'overdue'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' :
             f === 'todo' ? '⏳ To Do' :
             f === 'in_progress' ? '🔄 In Progress' :
             f === 'done' ? '✅ Done' : '🚨 Overdue'}
            <span className="filter-count">
              {f === 'all' ? tasks.length :
               f === 'overdue' ? tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length :
               tasks.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <p>No tasks in this category.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filtered.map(task => {
            const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';
            return (
              <div key={task.id} className={`task-row card ${isOverdue ? 'overdue' : ''}`}>
                <div className="task-row-left">
                  <div className={`priority-dot priority-${task.priority}`} />
                  <div>
                    <div className="task-row-title">{task.title}</div>
                    <div className="task-row-project">📁 {task.project_name}</div>
                  </div>
                </div>
                <div className="task-row-right">
                  {task.due_date && (
                    <span className={`due-tag ${isOverdue ? 'overdue-text' : ''}`}>
                      📅 {task.due_date}
                    </span>
                  )}
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  <select
                    className="status-select"
                    value={task.status}
                    onChange={e => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyTasks;
