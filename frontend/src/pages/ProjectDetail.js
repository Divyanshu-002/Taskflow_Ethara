import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  // Task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskError, setTaskError] = useState('');

  // Member form
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function fetchAll() {
    try {
      const [projectRes, taskRes, userRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`),
        API.get('/users')
      ]);
      setProject(projectRes.data);
      setTasks(taskRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setTaskError('');
    try {
      await API.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        project_id: id,
        assigned_to: taskAssignee || null,
        due_date: taskDue || null,
        priority: taskPriority
      });
      setTaskTitle(''); setTaskDesc(''); setTaskAssignee(''); setTaskDue('');
      setShowTaskForm(false);
      fetchAll();
    } catch (err) {
      setTaskError(err.response?.data?.error || 'Failed to create task.');
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert('Failed to update status.');
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, { userId: memberUserId, role: memberRole });
      setMemberUserId(''); setShowMemberForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member.');
    }
  }

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="loading">Project not found.</div>;

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="project-detail-page">
      {/* Project header */}
      <div className="project-header">
        <div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setShowMemberForm(!showMemberForm)}>
            + Add Member
          </button>
          <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Add Member Form */}
      {showMemberForm && (
        <div className="card form-card">
          <h3>Add Team Member</h3>
          <form onSubmit={handleAddMember} className="inline-form">
            <div className="form-group">
              <label>Select User</label>
              <select value={memberUserId} onChange={e => setMemberUserId(e.target.value)} required>
                <option value="">-- Choose user --</option>
                {users
                  .filter(u => u.id !== user.id && !project.members?.find(m => m.id === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))
                }
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add Member</button>
          </form>
        </div>
      )}

      {/* Add Task Form */}
      {showTaskForm && (
        <div className="card form-card">
          <h3>Create New Task</h3>
          {taskError && <div className="error-msg">{taskError}</div>}
          <form onSubmit={handleCreateTask}>
            <div className="form-row">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text" placeholder="What needs to be done?"
                  value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Task details..."
                value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </form>
        </div>
      )}

      {/* Members */}
      <div className="card members-card">
        <h3>Team Members ({project.members?.length || 0})</h3>
        <div className="members-list">
          {project.members?.map(m => (
            <div key={m.id} className="member-chip">
              <span className="member-avatar">{m.name[0].toUpperCase()}</span>
              <span>{m.name}</span>
              <span className={`badge badge-${m.role === 'admin' ? 'high' : 'todo'}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Board - 3 columns */}
      <div className="task-board">
        <TaskColumn
          title="To Do" emoji="⏳" tasks={todoTasks} statusValue="todo"
          onStatusChange={handleStatusChange} onDelete={handleDeleteTask}
          currentUser={user}
        />
        <TaskColumn
          title="In Progress" emoji="🔄" tasks={inProgressTasks} statusValue="in_progress"
          onStatusChange={handleStatusChange} onDelete={handleDeleteTask}
          currentUser={user}
        />
        <TaskColumn
          title="Done" emoji="✅" tasks={doneTasks} statusValue="done"
          onStatusChange={handleStatusChange} onDelete={handleDeleteTask}
          currentUser={user}
        />
      </div>
    </div>
  );
}

// Single column in the Kanban board
function TaskColumn({ title, emoji, tasks, statusValue, onStatusChange, onDelete, currentUser }) {
  const nextStatus = {
    'todo': 'in_progress',
    'in_progress': 'done',
    'done': 'todo'
  };

  const nextLabel = {
    'todo': 'Start →',
    'in_progress': 'Complete ✓',
    'done': 'Reopen ↺'
  };

  return (
    <div className="task-column">
      <div className="column-header">
        <span>{emoji} {title}</span>
        <span className="task-count">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="column-empty">No tasks here</div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className={`task-card priority-${task.priority}`}>
            <div className="task-card-header">
              <span className="task-card-title">{task.title}</span>
              <button
                className="delete-task-btn"
                onClick={() => onDelete(task.id)}
                title="Delete task"
              >×</button>
            </div>

            {task.description && (
              <p className="task-card-desc">{task.description}</p>
            )}

            <div className="task-card-meta">
              {task.assigned_to_name && (
                <span className="assignee">👤 {task.assigned_to_name}</span>
              )}
              {task.due_date && (
                <span className="task-due">📅 {task.due_date}</span>
              )}
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            </div>

            <button
              className="btn btn-outline move-btn"
              onClick={() => onStatusChange(task.id, nextStatus[statusValue])}
            >
              {nextLabel[statusValue]}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ProjectDetail;
