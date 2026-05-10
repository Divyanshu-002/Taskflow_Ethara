import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await API.get('/tasks/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  // Calculate task counts by status
  const getCount = (status) => {
    const found = stats?.tasksByStatus?.find(s => s.status === status);
    return found ? found.count : 0;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's what's happening with your tasks today.</p>
        </div>
        <Link to="/projects" className="btn btn-primary">+ New Project</Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📋</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.totalTasks || 0}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon todo">⏳</div>
          <div className="stat-info">
            <div className="stat-number">{getCount('todo')}</div>
            <div className="stat-label">To Do</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">🔄</div>
          <div className="stat-info">
            <div className="stat-number">{getCount('in_progress')}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon done">✅</div>
          <div className="stat-info">
            <div className="stat-number">{getCount('done')}</div>
            <div className="stat-label">Done</div>
          </div>
        </div>

        <div className="stat-card overdue">
          <div className="stat-icon overdue-icon">🚨</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.overdueTasks || 0}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="section-header">
          <h2>Recent Tasks</h2>
          <Link to="/my-tasks" className="view-all">View all →</Link>
        </div>

        {stats?.recentTasks?.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Start by creating a project!</p>
            <Link to="/projects" className="btn btn-primary" style={{ marginTop: 12 }}>
              Create Project
            </Link>
          </div>
        ) : (
          <div className="task-list">
            {stats?.recentTasks?.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <span className="task-project">📁 {task.project_name}</span>
                </div>
                <div className="task-meta">
                  <span className={`badge badge-${task.status}`}>
                    {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
                  </span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {task.due_date && (
                    <span className="due-date">Due: {task.due_date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
