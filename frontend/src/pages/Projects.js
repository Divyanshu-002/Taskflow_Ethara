import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await API.post('/projects', { name, description });
      setProjects(prevProjects => [res.data.project, ...prevProjects]);
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this project? All tasks will be deleted too.')) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  }

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your projects and teams</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Create project form */}
      {showForm && (
        <div className="card create-form">
          <h3>Create New Project</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                placeholder="e.g., Website Redesign"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="What is this project about?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="card empty-state">
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div className="project-icon">
                  {project.name[0].toUpperCase()}
                </div>
                <button
                  className="btn btn-danger delete-btn"
                  onClick={() => handleDelete(project.id)}
                  title="Delete project"
                >
                  🗑
                </button>
              </div>
              <h3>{project.name}</h3>
              <p className="project-desc">{project.description || 'No description'}</p>
              <div className="project-footer">
                <span className="project-owner">By: {project.owner_name}</span>
                <Link to={`/projects/${project.id}`} className="btn btn-outline view-btn">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
