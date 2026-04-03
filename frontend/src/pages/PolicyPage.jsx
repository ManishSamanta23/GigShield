import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiPause, FiPlay, FiTrendingUp, FiZap, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
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

const calculatePremium = (base, riskScore) => {
  if (riskScore == null) return base;
  return base + Math.round((riskScore - 0.55) * 40);
};

const PolicyPage = () => {
  const { worker } = useAuth();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
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
        toast.error('Failed to load policy data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSaved30Days = claims
    .filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status))
    .filter(c => {
      const claimDate = new Date(c.claimDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return claimDate >= thirtyDaysAgo;
    })
    .reduce((sum, c) => sum + c.payoutAmount, 0);

  const getShieldAdvice = () => {
    const city = worker?.city || 'your city';
    // Mock logic for forecast-driven advice
    if (policy?.plan === 'Max') return null;
    
    const highRiskCities = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'];
    const isHighRiskCity = highRiskCities.includes(worker?.city);
    
    if (isHighRiskCity) {
      return {
        message: `Heavy rainfall predicted in ${city} next week. We recommend the Max Shield for complete coverage against waterlogging and flood disruptions.`,
        targetPlan: 'Max'
      };
    } else if (policy?.plan === 'Basic' || !policy) {
      return {
        message: `AQI fluctuations detected in ${city}. Upgrade to Pro Shield to protect your earnings from pollution-related zone shutdowns.`,
        targetPlan: 'Pro'
      };
    }
    return null;
  };

  const advice = getShieldAdvice();

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
        <h1>My Protection</h1>
        <p>Manage your weekly income security & track protected earnings</p>
      </div>

      {/* Savings Tracker & Advisor Row */}
      <div className="policy-highlights">
        <div className="savings-tracker-card card">
          <div className="st-header">
            <FiTrendingUp color="#00C49F" size={20} />
            <h4>Income Protected (Last 30 Days)</h4>
          </div>
          <div className="st-body">
            <span className="st-amount">₹{totalSaved30Days.toLocaleString()}</span>
            <span className="st-label">Recovered from disruptions</span>
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
                {policy ? `Upgrade to ${advice.targetPlan}` : `View ${advice.targetPlan} Plan`}
              </button>
            ) : null}
          </div>
        )}
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
        <div id="plans-section">
          <div className="plans-intro">
            <h2>Choose Your Weekly Plan</h2>
            <p>Premium auto-deducts every Monday via UPI. Cancel anytime.</p>
          </div>
          <div className="plans-grid-policy">
            {PLANS.map(p => {
              const dynamicPremium = calculatePremium(p.premium, worker?.riskScore);
              return (
              <div key={p.name} className={`plan-card-policy card ${p.popular ? 'popular' : ''}`}>
                {p.popular && <div className="popular-badge">Most Popular</div>}
                <h3 style={{ color: p.color }}>{p.name} Shield</h3>
                <div className="plan-price-big">
                  <strong>₹{dynamicPremium}</strong><span>/week</span>
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
            )})}
          </div>
        </div>
      )}

      {/* Upgrade Options */}
      {policy && (
        <div className="upgrade-section">
          <h3>Upgrade Your Plan</h3>
          <p>Get more coverage for a few rupees more per week</p>
          <div className="upgrade-cards">
            {PLANS.filter(p => p.name !== policy.plan).map(p => {
              const dynamicPremium = calculatePremium(p.premium, worker?.riskScore);
              return (
              <div key={p.name} className="upgrade-card card">
                <h4 style={{ color: p.color }}>{p.name} Shield</h4>
                <p className="upgrade-price">₹{dynamicPremium}/week · ₹{p.payout.toLocaleString()} max</p>
                <button className="btn-outline-orange"
                  onClick={() => navigate(`/upgrade?plan=${p.name.toLowerCase()}`)}>
                  Upgrade to {p.name}
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
