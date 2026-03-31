import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ClaimsPage.css';

const TRIGGERS = ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'];

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ triggerType: 'Heavy Rainfall', triggerValue: '', hoursLost: 3 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/claims/my').then(r => { setClaims(r.data); setLoading(false); });
  }, []);

  const submitClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/claims', form);
      setClaims([data, ...claims]);
      setShowForm(false);
      toast.success(
        data.status === 'Auto-Approved'
          ? `Claim auto-approved! ₹${data.payoutAmount} will be sent to your UPI 🎉`
          : `Claim submitted for review. You'll hear back shortly.`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    'Auto-Approved': { badge: 'green', icon: <FiCheckCircle />, label: 'Auto-Approved' },
    'Approved':      { badge: 'green', icon: <FiCheckCircle />, label: 'Approved' },
    'Paid':          { badge: 'green', icon: <FiCheckCircle />, label: 'Paid' },
    'Under Review':  { badge: 'yellow', icon: <FiClock />,      label: 'Under Review' },
    'Pending':       { badge: 'blue',   icon: <FiClock />,      label: 'Pending' },
    'Rejected':      { badge: 'red',    icon: <FiAlertCircle />,label: 'Rejected' },
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="claims-page page-container">
      <div className="page-header-row">
        <div>
          <h1>Claims</h1>
          <p>Your income protection claim history</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Claim'}
        </button>
      </div>

      {/* Claim Form */}
      {showForm && (
        <div className="claim-form card fade-up">
          <h3>Submit a Claim</h3>
          <p className="form-note">Claims are auto-validated against live weather/AQI data</p>
          <form onSubmit={submitClaim}>
            <div className="form-row-3">
              <div className="input-group">
                <label>Disruption Type</label>
                <select value={form.triggerType}
                  onChange={e => setForm({ ...form, triggerType: e.target.value })}>
                  {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Observed Value (Optional)</label>
                <input placeholder="e.g. AQI 380, Temp 46°C"
                  value={form.triggerValue}
                  onChange={e => setForm({ ...form, triggerValue: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Hours Lost</label>
                <input type="number" min="1" max="12" value={form.hoursLost}
                  onChange={e => setForm({ ...form, hoursLost: parseInt(e.target.value) })} required />
              </div>
            </div>
            <div className="claim-note">
              <FiAlertCircle size={14} color="#FFD166" />
              <span>GigShield covers income loss only. Vehicle damage and health costs are excluded.</span>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : 'Submit Claim'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Row */}
      <div className="claims-stats">
        {[
          { label: 'Total Claims', val: claims.length, color: '#63B3ED' },
          { label: 'Auto-Approved', val: claims.filter(c => c.status === 'Auto-Approved').length, color: '#00C49F' },
          { label: 'Under Review', val: claims.filter(c => c.status === 'Under Review').length, color: '#FFD166' },
          { label: 'Total Payout', val: `₹${claims.filter(c => ['Auto-Approved','Approved'].includes(c.status)).reduce((s,c) => s + c.payoutAmount, 0).toLocaleString()}`, color: '#FF6B35' },
        ].map((s, i) => (
          <div className="cs-card card" key={i}>
            <p className="cs-label">{s.label}</p>
            <h3 style={{ color: s.color }}>{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Claims Table */}
      {claims.length === 0 ? (
        <div className="empty-state card">
          <FiCheckCircle size={48} color="#00C49F" />
          <h3>No claims yet</h3>
          <p>When a disruption occurs in your zone, claims are auto-initiated. Stay protected!</p>
        </div>
      ) : (
        <div className="claims-table card">
          <div className="table-header">
            <span>Trigger</span>
            <span>Date</span>
            <span>Hours Lost</span>
            <span>Payout</span>
            <span>Status</span>
            <span>Fraud Score</span>
          </div>
          {claims.map(c => {
            const s = statusConfig[c.status] || statusConfig['Pending'];
            return (
              <div className="table-row" key={c._id}>
                <span className="col-trigger">{c.triggerType}</span>
                <span className="col-muted">{new Date(c.claimDate).toLocaleDateString('en-IN')}</span>
                <span>{c.hoursLost} hrs</span>
                <span className="col-amount">₹{c.payoutAmount}</span>
                <span><span className={`badge badge-${s.badge}`}>{s.label}</span></span>
                <span>
                  <div className="fraud-bar">
                    <div className="fraud-fill"
                      style={{ width: `${c.fraudScore * 100}%`,
                        background: c.fraudScore < 0.3 ? '#00C49F' : c.fraudScore < 0.6 ? '#FFD166' : '#FF4444' }} />
                  </div>
                  <span className="fraud-val">{(c.fraudScore * 100).toFixed(0)}%</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
