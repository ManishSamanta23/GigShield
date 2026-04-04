import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiPause, FiPlay, FiTrendingUp, FiZap, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './PolicyPage.css';
import ShieldIcon from '../components/ShieldIcon';

/**
 * Static Configuration:
 * Defines the baseline insurance tiers and their associated payouts/events.
 */
const PLANS = [
  { name: 'Basic', premium: 29, payout: 800, color: '#63B3ED',
    events: ['Heavy Rainfall', 'Flash Flood'] },
  { name: 'Pro', premium: 49, payout: 1500, color: '#FF6B35', popular: true,
    events: ['Heavy Rainfall', 'Flash Flood', 'Severe AQI', 'Curfew/Bandh'] },
  { name: 'Max', premium: 79, payout: 2500, color: '#00C49F',
    events: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'] },
];

/**
 * Custom Pricing Logic:
 * Adjusts the standard weekly premium based on the worker's unique risk profile.
 */
const calculatePremium = (base, riskScore) => {
  if (riskScore == null) return base;
  return base + Math.round((riskScore - 0.55) * 40);
};

/**
 * Policy Management Dashboard
 * Displays active coverage details, premium settings, and AI-driven shield advice.
 */
const PolicyPage = () => {
  const { worker } = useAuth();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    // Aggregated data fetch for active policy and claim history
    const fetchData = async () => {
      try {
        const [policyRes, claimsRes] = await Promise.all([
          api.get('/policies/my'),
          api.get('/claims/my')
        ]);
        
        const activePolicy = policyRes.data.find(p => p.status === 'Active');
        setPolicy(activePolicy || policyRes.data[0] || null);
        setClaims(claimsRes.data);
      } catch (err) {
        toast.error('Could not retrieve policy records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Analytics Calculation:
   * Aggregates total income recovered via parametric payouts in the trailing 30 days.
   */
  const totalSaved30Days = claims
    .filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status))
    .filter(c => {
      const claimDate = new Date(c.claimDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return claimDate >= thirtyDaysAgo;
    })
    .reduce((sum, c) => sum + c.payoutAmount, 0);

  /**
   * Shield Advisor (Predictive Logic):
   * Analyzes worker constraints (city, current plan) and alerts to impending 
   * environmental risks to suggest optimal coverage upgrades.
   */
  const getShieldAdvice = () => {
    const city = worker?.city || 'your city';
    if (policy?.plan === 'Max') return null;
    
    const highRiskCities = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'];
    const isHighRiskCity = highRiskCities.includes(worker?.city);
    
    if (isHighRiskCity) {
      return {
        message: `Increased disruption risk detected in ${city}. Upgrade to Max Shield for full recovery against heavy waterlogging.`,
        targetPlan: 'Max'
      };
    } else if (policy?.plan === 'Basic' || !policy) {
      return {
        message: `AQI alerts common in ${city}. Pro Shield is recommended to cover pollution-related shutdowns.`,
        targetPlan: 'Pro'
      };
    }
    return null;
  };

  const advice = getShieldAdvice();

  /**
   * Policy Orchestration:
   * Manages plan activation, state transitions, and asynchronous operations.
   */
  const activate = async (planName) => {
    setActivating(planName);
    try {
      const { data } = await api.post('/policies', { plan: planName });
      setPolicy(data);
      toast.success(`${planName} coverage successfully activated. 🛡️`);
    } catch (err) {
      toast.error('Plan activation fault: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setActivating(null);
    }
  };

  /**
   * Coverage Lifecycle Management:
   * Toggles the policy status between 'Active' and 'Paused'.
   */
  const togglePause = async () => {
    try {
      const { data } = await api.put(`/policies/${policy._id}/pause`);
      setPolicy(data);
      toast.success(data.status === 'Paused' ? 'Coverage temporarily suspended' : 'Coverage resumed');
    } catch (err) {
      toast.error('Failed to update coverage lifecycle state');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="policy-page page-container">
      <div className="page-header">
        <h1>Safety & Rewards</h1>
        <p>Manage your weekly income protection and track recovered earnings.</p>
      </div>

      <div className="policy-highlights">
        <div className="savings-tracker-card card">
          <div className="st-header">
            <FiTrendingUp color="#00C49F" size={20} />
            <h4 style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'tnum' on, 'lnum' on", letterSpacing: "0.08em" }}>Lifetime Impact (Last 30 Days)</h4>
          </div>
          <div className="st-body">
            <span className="st-amount">₹{totalSaved30Days.toLocaleString()}</span>
            <span className="st-label">Recovered Protected Earnings</span>
          </div>
        </div>

        {advice && (
          <div className="shield-advisor-card card">
            <div className="sa-header">
              <FiZap color="#FFD166" size={20} />
              <h4>Shield Advisor</h4>
            </div>
            <p className="sa-message">{advice.message}</p>
            {!policy || (policy.plan !== advice.targetPlan) ? (
              <button className="sa-action" onClick={() => {
                if (policy) navigate(`/upgrade?plan=${advice.targetPlan.toLowerCase()}`);
                else document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' });
              }}>
                {policy ? `Upgrade to ${advice.targetPlan}` : `Select ${advice.targetPlan}`}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {policy && (
        <div className="active-policy card">
          <div className="ap-header">
            <div className="ap-title">
              <ShieldIcon size={28} color="#FF6B35" />
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
              <span>Max Benefit/Week</span>
              <strong>₹{policy.maxWeeklyPayout.toLocaleString()}</strong>
            </div>
            <div className="ap-stat">
              <span>Total Recovery</span>
              <strong>₹{policy.totalPayoutReceived.toLocaleString()}</strong>
            </div>
            <div className="ap-stat">
              <span>Next Renewal</span>
              <strong>{new Date(policy.nextBillingDate).toLocaleDateString('en-IN')}</strong>
            </div>
          </div>
          <div className="ap-events">
            <p>Covered External Events:</p>
            <div className="event-tags">
              {policy.coverageEvents.map(e => (
                <span key={e} className="event-tag"><FiCheckCircle size={12} /> {e}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!policy && (
        <div id="plans-section">
          <div className="plans-intro">
            <h2>Select Coverage Tier</h2>
            <p>Weekly premiums are auto-deducted via UPI linked account.</p>
          </div>
          <div className="plans-grid-policy">
            {PLANS.map(p => {
              const dynamicPremium = calculatePremium(p.premium, worker?.riskScore);
              return (
              <div key={p.name} className={`plan-card-policy card ${p.popular ? 'popular' : ''}`}>
                {p.popular && <div className="popular-badge">Best Choice</div>}
                <h3 style={{ color: p.color }}>{p.name} Shield</h3>
                <div className="plan-price-big">
                  <strong>₹{dynamicPremium}</strong><span>/week</span>
                </div>
                <p className="payout-label">Up to ₹{p.payout.toLocaleString()} protection</p>
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
                  {activating === p.name ? 'Processing...' : `Activate ${p.name}`}
                </button>
              </div>
            )})}
          </div>
        </div>
      )}

      {policy && (
        <div className="upgrade-section">
          <h3>Upgrade Tier</h3>
          <p>Expand your protection scope for increased income security</p>
          <div className="upgrade-cards">
            {PLANS.filter(p => p.name !== policy.plan).map(p => {
              const dynamicPremium = calculatePremium(p.premium, worker?.riskScore);
              return (
              <div key={p.name} className="upgrade-card card">
                <h4 style={{ color: p.color }}>{p.name} Shield</h4>
                <p className="upgrade-price">₹{dynamicPremium}/week · ₹{p.payout.toLocaleString()} limit</p>
                <button className="btn-outline-orange"
                  onClick={() => navigate(`/upgrade?plan=${p.name.toLowerCase()}`)}>
                  Switch to {p.name}
                </button>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyPage;
