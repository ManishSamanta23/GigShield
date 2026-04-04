import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiDollarSign, FiAlertTriangle, FiCheckCircle, FiArrowRight, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { WiCloud, WiSmog } from 'react-icons/wi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getCurrentLocation } from '../utils/geolocation';
import { getWeather, getAQI, formatWeatherDisplay, formatAQIDisplay } from '../utils/weather';
import './DashboardPage.css';
import ShieldIcon from '../components/ShieldIcon';

const StatCard = ({ icon, label, value, sub, color, style = {}, className = '', valueStyle = {}, subStyle = {} }) => (
  <div className={`stat-card card ${className}`.trim()} style={style}>
    <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value" style={valueStyle}>{value}</h3>
      {sub && <p className="stat-sub" style={subStyle}>{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { worker } = useAuth();
  const [data, setData] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [location, setLocation] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

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

        // Fetch weather and AQI using geolocation
        try {
          const currentLoc = await getCurrentLocation();
          setLocation(currentLoc);

          // Fetch weather data
          try {
            const weatherData = await getWeather(currentLoc.latitude, currentLoc.longitude);
            setWeather(weatherData);
            setWeatherError(null);
          } catch (weatherErr) {
            console.error('Weather fetch error:', weatherErr.response?.data || weatherErr.message);
            setWeatherError(weatherErr.response?.data?.message || 'Failed to load weather');
          }

          // Fetch AQI data
          try {
            const aqiData = await getAQI(currentLoc.latitude, currentLoc.longitude);
            setAqi(aqiData);
          } catch (aqiErr) {
            console.error('AQI fetch error:', aqiErr.response?.data || aqiErr.message);
          }
        } catch (locErr) {
          console.warn('Could not get location:', locErr);
          setWeatherError('Location access denied - using stored location');
          // Continue loading dashboard even if location fails
        }
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
            <ShieldIcon />
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
        {/* Error Card */}
        {weatherError && (
          <div className="card" style={{ background: 'rgba(255, 107, 53, 0.1)', borderColor: '#FF6B35', borderWidth: '2px', gridColumn: '1 / -1', marginBottom: '16px' }}>
            <p style={{ color: '#FF6B35', fontSize: '14px', fontWeight: '600' }}>⚠️ Weather Data Issue</p>
            <p style={{ color: '#FF8C5A', fontSize: '13px', marginTop: '8px' }}>{weatherError}</p>
            <p style={{ color: '#8899BB', fontSize: '12px', marginTop: '8px' }}>
              💡 Tip: Check server console for API errors or add OPENWEATHER_API_KEY to server/.env
            </p>
          </div>
        )}

        {/* Weather & Air Quality Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', gridColumn: '1 / -1' }}>
          {/* Weather Card */}
          {weather && aqi && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #162347 0%, #1e3060 100%)', borderLeft: '2px solid #f97316', boxShadow: 'inset 2px 0 20px rgba(249,115,22,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#8899BB', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Current Weather</p>
                  <h3 style={{ fontSize: '28px', color: '#FF6B35', fontFamily: "var(--font-numbers)" }}>{Math.round(weather.temp)}°C</h3>
                  <p style={{ color: '#8899BB', fontSize: '14px' }}>{weather.weather?.[0]?.main}</p>
                </div>
                <WiCloud size={32} color="#63B3ED" />
              </div>
              {/* Location Info */}
              {location && (
                <div style={{ marginTop: '4px', marginBottom: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    <FiMapPin size={12} color="#f97316" />
                    <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', fontFamily: "'Inter', sans-serif", margin: 0, lineHeight: 1 }}>{location.city || 'Detected'}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontFamily: "'Inter', sans-serif", margin: 0, marginLeft: '4px', lineHeight: 1 }}>±{Math.round(location.accuracy)}m</p>
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#8899BB', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '12px' }}>
                <div>💧 {weather.humidity}%</div>
                <div>💨 {Math.round(weather.wind_speed * 3.6)} km/h</div>
              </div>
            </div>
          )}

          {/* Air Quality Card */}
          {aqi && (() => { const aqiColor = formatAQIDisplay(aqi).color; return (
            <div className="card" style={{ background: 'linear-gradient(135deg, #162347 0%, #1e3060 100%)', borderLeft: `2px solid ${aqiColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#8899BB', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Air Quality</p>
                  <h3 style={{ fontSize: '28px', color: aqiColor, fontFamily: "var(--font-head)" }}>{formatAQIDisplay(aqi).level}</h3>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px 10px', marginTop: '4px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>PM2.5</span>
                    <span style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.2)' }}/>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{formatAQIDisplay(aqi).pm25}</span>
                  </div>
                  <div className="aqi-bar-track">
                    <div className="aqi-bar-fill" />
                  </div>
                </div>
                <WiSmog size={32} color={aqiColor} />
              </div>
            </div>
          ); })()}
        </div>
        
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
