import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">✦</span>
        <span className="brand-name">TaskFlow</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/projects" className={location.pathname.startsWith('/projects') ? 'active' : ''}>
          Projects
        </Link>
        <Link to="/my-tasks" className={location.pathname === '/my-tasks' ? 'active' : ''}>
          My Tasks
        </Link>
      </div>

      <div className="navbar-user">
        <span className="user-info">
          <span className="user-avatar">{user?.name?.[0]?.toUpperCase()}</span>
          <span className="user-name">{user?.name}</span>
          {user?.role === 'admin' && <span className="role-badge">Admin</span>}
        </span>
        <button onClick={handleLogout} className="btn btn-outline logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
