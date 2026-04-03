import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    platform: 'Zepto', platformId: '',
    city: 'Mumbai', pincode: '',
    avgWeeklyEarnings: 4000, avgDailyHours: 10,
    password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      toast.success('Account created! Welcome to Avaran 🛡️');
      navigate('/policy');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card card wide">
        <div className="auth-logo">
          <FiShield color="#FF6B35" size={32} />
          <h2>Avaran</h2>
        </div>

        <div className="steps-indicator">
          {[1, 2].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>
              <span>{s}</span>
              <label>{s === 1 ? 'Basic Info' : 'Work Details'}</label>
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
          {step === 1 && (
            <>
              <h3>Personal Information</h3>
              <p className="auth-sub">Get protected in under 60 seconds</p>
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input placeholder="Raju Sharma" value={form.name}
                    onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="9876543210" value={form.phone}
                    onChange={e => set('phone', e.target.value)} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email (Optional)</label>
                <input type="email" placeholder="raju@email.com" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Min 6 characters" value={form.password}
                    onChange={e => set('password', e.target.value)} required minLength={6} />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Repeat password" value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-btn">Next →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Work Information</h3>
              <p className="auth-sub">Helps us calculate your coverage accurately</p>
              <div className="form-row">
                <div className="input-group">
                  <label>Delivery Platform</label>
                  <select value={form.platform} onChange={e => set('platform', e.target.value)}>
                    <option>Zepto</option>
                    <option>Blinkit</option>
                    <option>Both</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Platform Partner ID</label>
                  <input placeholder="Your Zepto/Blinkit ID" value={form.platformId}
                    onChange={e => set('platformId', e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>City</label>
                  <select value={form.city} onChange={e => set('city', e.target.value)}>
                    {cities.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Pincode</label>
                  <input placeholder="400001" value={form.pincode}
                    onChange={e => set('pincode', e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Avg Weekly Earnings (₹)</label>
                  <input type="number" min="1000" max="20000"
                    value={form.avgWeeklyEarnings}
                    onChange={e => set('avgWeeklyEarnings', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Avg Daily Hours</label>
                  <input type="number" min="4" max="16"
                    value={form.avgDailyHours}
                    onChange={e => set('avgDailyHours', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account 🛡️'}
                </button>
              </div>
            </>
          )}
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
