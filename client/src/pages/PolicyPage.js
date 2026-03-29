import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiShield, FiPause, FiPlay } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './PolicyPage.css';

const PLANS = [
  { name: 'Basic', premium: 29, payout: 800, color: '#63B3ED',
    events: ['Heavy Rainfall', 'Flash Flood'] },
  { name: 'Pro', premium: 49, payout: 1500, color: '#FF6B35', popular: true,
    events: ['Heavy Rainfall', 'Flash Flood', 'Severe AQI', 'Curfew/Bandh'] },
  { name: 'Max', premium: 79, payout: 2500, color: '#00C49F',
    events: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'] },
];

const PolicyPage = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    api.get('/policies/my').then(r => {
      setPolicy(r.data[0] || null);
      setLoading(false);
    });
  }, []);

  const activate = async (planName) => {
    setActivating(planName);
    try {
      const { data } = await api.post('/policies', { plan: planName });
      setPolicy(data);
      toast.success(`${planName} Shield activated! You're now protected 🛡️`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate');
    } finally {
      setActivating(null);
    }
  };

  const togglePause = async () => {
    try {
      const { data } = await api.put(`/policies/${policy._id}/pause`);
      setPolicy(data);
      toast.success(data.status === 'Paused' ? 'Coverage paused' : 'Coverage resumed!');
    } catch (err) {
      toast.error('Failed to update policy');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="policy-page page-container">
      <div className="page-header">
        <h1>My Policy</h1>
        <p>Manage your weekly income protection coverage</p>
      </div>

      {/* Active Policy Card */}
      {policy && (
        <div className="active-policy card">
          <div className="ap-header">
            <div className="ap-title">
              <FiShield size={28} color="#FF6B35" />
              <div>
                <h3>{policy.plan} Shield</h3>
                <span className={`badge badge-${policy.status === 'Active' ? 'green' : 'yellow'}`}>
                  {policy.status}
                </span>
              </div>
            </div>
            <button className="btn-outline-orange" onClick={togglePause}>
              {policy.status === 'Active'
                ? <><FiPause size={14} /> Pause Coverage</>
                : <><FiPlay size={14} /> Resume Coverage</>}
            </button>
          </div>
          <div className="ap-stats">
            <div className="ap-stat">
              <span>Weekly Premium</span>
              <strong>₹{policy.weeklyPremium}</strong>
            </div>
            <div className="ap-stat">
              <span>Max Weekly Payout</span>
              <strong>₹{policy.maxWeeklyPayout.toLocaleString()}</strong>
            </div>
            <div className="ap-stat">
              <span>Total Paid Out</span>
              <strong>₹{policy.totalPayoutReceived.toLocaleString()}</strong>
            </div>
            <div className="ap-stat">
              <span>Next Billing</span>
              <strong>{new Date(policy.nextBillingDate).toLocaleDateString('en-IN')}</strong>
            </div>
          </div>
          <div className="ap-events">
            <p>Covered Events:</p>
            <div className="event-tags">
              {policy.coverageEvents.map(e => (
                <span key={e} className="event-tag"><FiCheckCircle size={12} /> {e}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection */}
      {!policy && (
        <>
          <div className="plans-intro">
            <h2>Choose Your Weekly Plan</h2>
            <p>Premium auto-deducts every Monday via UPI. Cancel anytime.</p>
          </div>
          <div className="plans-grid-policy">
            {PLANS.map(p => (
              <div key={p.name} className={`plan-card-policy card ${p.popular ? 'popular' : ''}`}>
                {p.popular && <div className="popular-badge">Most Popular</div>}
                <h3 style={{ color: p.color }}>{p.name} Shield</h3>
                <div className="plan-price-big">
                  <strong>₹{p.premium}</strong><span>/week</span>
                </div>
                <p className="payout-label">Up to ₹{p.payout.toLocaleString()} payout/week</p>
                <ul className="plan-events">
                  {p.events.map(e => (
                    <li key={e}><FiCheckCircle style={{ color: p.color }} size={14} /> {e}</li>
                  ))}
                </ul>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center',
                    background: p.popular ? 'var(--orange)' : p.color }}
                  onClick={() => activate(p.name)}
                  disabled={activating === p.name}
                >
                  {activating === p.name ? 'Activating...' : `Activate ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upgrade Options */}
      {policy && (
        <div className="upgrade-section">
          <h3>Upgrade Your Plan</h3>
          <p>Get more coverage for a few rupees more per week</p>
          <div className="upgrade-cards">
            {PLANS.filter(p => p.name !== policy.plan).map(p => (
              <div key={p.name} className="upgrade-card card">
                <h4 style={{ color: p.color }}>{p.name} Shield</h4>
                <p className="upgrade-price">₹{p.premium}/week · ₹{p.payout.toLocaleString()} max</p>
                <button className="btn-outline-orange"
                  onClick={() => toast('Contact support to upgrade plans')}>
                  Upgrade to {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyPage;
