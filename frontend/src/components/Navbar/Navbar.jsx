import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { worker, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/policy',    label: 'My Policy' },
    { to: '/claims',    label: 'Claims' },
    { to: '/triggers',  label: 'Live Alerts' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-inner page-container">
        <Link to="/" className="nav-logo">
          <FiShield className="logo-icon" />
          <span>Avaran</span>
        </Link>

        {worker && (
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map(l => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={location.pathname === l.to ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >{l.label}</Link>
              </li>
            ))}
          </ul>
        )}

        <div className="nav-actions">
          {worker ? (
            <>
              <span className="nav-user">
                <FiUser size={14} /> {worker.name?.split(' ')[0]}
              </span>
              <button className="btn-secondary" onClick={handleLogout}>
                <FiLogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
