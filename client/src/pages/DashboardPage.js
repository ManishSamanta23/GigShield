import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiShield, FiDollarSign, FiAlertTriangle, FiCheckCircle, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './DashboardPage.css';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card card">
    <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { worker } = useAuth();
  const [data, setData] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analytics, policyRes, claimsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/policies/my'),
          api.get('/claims/my')
        ]);
        setData(analytics.data);
        setPolicy(policyRes.data[0] || null);
        setClaims(claimsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Loading your dashboard...</p>
    </div>
  );

  const statusColor = { 'Auto-Approved': 'green', 'Approved': 'green',
    'Paid': 'green', 'Under Review': 'yellow', 'Pending': 'blue', 'Rejected': 'red' };

  return (
    <div className="dashboard page-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Welcome back, {worker?.name?.split(' ')[0]}</h1>
          <p>{worker?.platform} Partner · {worker?.city} ·
            <span className={`risk-tag ${worker?.riskZone?.toLowerCase()}`}>
              {worker?.riskZone} Risk Zone
            </span>
          </p>
        </div>
        {!policy && (
          <Link to="/policy" className="btn-primary">
            Activate Coverage <FiArrowRight />
          </Link>
        )}
      </div>

      {/* Policy Banner */}
      {policy ? (
        <div className="policy-banner card">
          <div className="policy-info">
            <FiShield size={28} color="#FF6B35" />
            <div>
              <h4>{policy.plan} Shield — Active</h4>
              <p>₹{policy.weeklyPremium}/week · Up to ₹{policy.maxWeeklyPayout.toLocaleString()} payout</p>
            </div>
          </div>
          <div className="policy-meta">
            <span>Next billing: {new Date(policy.nextBillingDate).toLocaleDateString('en-IN')}</span>
            <Link to="/policy" className="btn-outline-orange">Manage</Link>
          </div>
        </div>
      ) : (
        <div className="no-policy-banner card">
          <FiAlertTriangle color="#FFD166" size={24} />
          <div>
            <h4>No active coverage</h4>
            <p>You're not protected yet. Activate a plan starting at ₹29/week.</p>
          </div>
          <Link to="/policy" className="btn-primary">Get Protected</Link>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={<FiDollarSign />} label="Earnings Protected"
          value={`₹${(data?.earningsProtected || 0).toLocaleString()}`}
          sub="Total payouts received" color="#00C49F" />
        <StatCard icon={<FiCheckCircle />} label="Claims Approved"
          value={data?.approvedClaims || 0}
          sub={`${data?.coverageRate || 100}% approval rate`} color="#FF6B35" />
        <StatCard icon={<FiAlertTriangle />} label="Total Claims"
          value={data?.totalClaims || 0}
          sub="All time" color="#63B3ED" />
        <StatCard icon={<FiTrendingUp />} label="Premium Paid"
          value={`₹${(data?.totalPremium || 0).toLocaleString()}`}
          sub="Total invested" color="#A78BFA" />
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card card">
          <h4>Weekly Payout History</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.weeklyData || []}>
              <defs>
                <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" stroke="#8899BB" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8899BB" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#162347', border: '1px solid #1e3060', borderRadius: 8 }} />
              <Area type="monotone" dataKey="payout" stroke="#FF6B35" fill="url(#payoutGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card card">
          <h4>Weekly Claims Count</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.weeklyData || []}>
              <XAxis dataKey="week" stroke="#8899BB" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8899BB" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#162347', border: '1px solid #1e3060', borderRadius: 8 }} />
              <Bar dataKey="claims" fill="#00C49F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="card">
        <div className="section-title-row">
          <h4>Recent Claims</h4>
          <Link to="/claims" className="btn-outline-orange">View All</Link>
        </div>
        {claims.length === 0 ? (
          <p className="empty-msg">No claims yet. Stay protected!</p>
        ) : (
          <div className="claims-list">
            {claims.map(c => (
              <div className="claim-row" key={c._id}>
                <div>
                  <p className="claim-type">{c.triggerType}</p>
                  <p className="claim-date">{new Date(c.claimDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="claim-right">
                  <span className={`badge badge-${statusColor[c.status] || 'blue'}`}>{c.status}</span>
                  <strong className="claim-amount">₹{c.payoutAmount}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
