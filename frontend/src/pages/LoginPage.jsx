import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiPhone, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const LoginPage = () => {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card card">
        <div className="auth-logo">
          <FiShield color="#FF6B35" size={32} />
          <h2>Gig<span>Shield</span></h2>
        </div>
        <h3>Welcome back</h3>
        <p className="auth-sub">Login to manage your coverage</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><FiPhone size={12} /> Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label><FiLock size={12} /> Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">
          New to GigShield? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
