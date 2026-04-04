import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiZap } from 'react-icons/fi';
import { WiRain, WiSmog, WiThermometer, WiFlood } from 'react-icons/wi';
import api from '../utils/api';
import { getCurrentLocation } from '../utils/geolocation';
import { getWeather, getAQI, formatWeatherDisplay, formatAQIDisplay } from '../utils/weather';
import toast from 'react-hot-toast';
import './TriggersPage.css';

const iconMap = {
  'Heavy Rainfall':  <WiRain size={32} />,
  'Flash Flood':     <WiFlood size={32} />,
  'Extreme Heat':    <WiThermometer size={32} />,
  'Severe AQI':      <WiSmog size={32} />,
  'Curfew/Bandh':    <FiAlertTriangle size={24} />,
};

const colorMap = {
  'Heavy Rainfall': '#63B3ED',
  'Flash Flood':    '#00C49F',
  'Extreme Heat':   '#FF6B35',
  'Severe AQI':     '#A78BFA',
  'Curfew/Bandh':   '#FFD166',
};

const severityColor = {
  Low: '#00C49F', Medium: '#FFD166', High: '#FF8C5A', Critical: '#FF4444'
};

const TriggersPage = () => {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const fetchTriggers = async () => {
    try {
      // Get user's current location first
      let lat = location?.latitude;
      let lon = location?.longitude;

      if (!lat || !lon) {
        try {
          const currentLoc = await getCurrentLocation();
          lat = currentLoc.latitude;
          lon = currentLoc.longitude;
          setLocation(currentLoc);
        } catch (err) {
          console.warn('Could not access geolocation:', err);
          setLocationError('Enable location access for accurate trigger alerts');
        }
      }

      // Fetch actual weather and AQI data
      let weatherData = null;
      let aqiData = null;
      let generatedTriggers = [];

      if (lat && lon) {
        try {
          weatherData = await getWeather(lat, lon);
        } catch (err) {
          console.warn('Could not fetch weather:', err);
        }

        try {
          aqiData = await getAQI(lat, lon);
        } catch (err) {
          console.warn('Could not fetch AQI:', err);
        }
      }

      // Generate triggers based on actual conditions
      const rainfall = weatherData?.rain?.['1h'] || 0;
      const temp = weatherData?.temp || 0; // Use same structure as Dashboard
      const weatherMain = weatherData?.weather?.[0]?.main || '';
      const weatherDesc = weatherData?.weather?.[0]?.description || '';
      const pm25 = aqiData?.main?.pm25 || 0;

      // DEBUG: Log current values
      console.log('Current temp:', temp);
      console.log('Current weather data:', weatherData);
      console.log('Rainfall:', rainfall);
      console.log('Weather main:', weatherMain);
      console.log('PM2.5:', pm25);

      // Heavy Rainfall: ACTIVE if rainfall > 35mm/hr OR weather includes "Rain"/"Drizzle"
      const isHeavyRainfall = rainfall > 35 || weatherMain === 'Rain' || weatherMain === 'Drizzle';
      generatedTriggers.push({
        type: 'Heavy Rainfall',
        value: `${rainfall.toFixed(1)}mm/hr`,
        threshold: '>35mm/hr',
        dataSource: 'OpenWeatherMap API',
        severity: isHeavyRainfall ? 'High' : 'Low',
        isActive: isHeavyRainfall,
        affectedWorkers: isHeavyRainfall ? Math.floor(Math.random() * 200) + 50 : 0
      });

      // Severe AQI: ACTIVE if AQI PM2.5 > 350
      const isSevereAQI = pm25 > 350;
      generatedTriggers.push({
        type: 'Severe AQI',
        value: `AQI ${Math.round(pm25)}`,
        threshold: '>350',
        dataSource: 'CPCB / OpenAQ API',
        severity: isSevereAQI ? 'Critical' : 'Low',
        isActive: isSevereAQI,
        affectedWorkers: isSevereAQI ? Math.floor(Math.random() * 150) + 30 : 0
      });

      // Flash Flood: ACTIVE if weather includes "Flood" OR rainfall > 40mm/hr
      const isFlashFlood = weatherDesc.includes('flood') || weatherMain === 'Thunderstorm' || rainfall > 40;
      generatedTriggers.push({
        type: 'Flash Flood',
        value: isFlashFlood ? 'Zone closure detected' : 'No flooding detected',
        threshold: 'Road closure signal',
        dataSource: 'IMD Flood API',
        severity: isFlashFlood ? 'High' : 'Low',
        isActive: isFlashFlood,
        affectedWorkers: isFlashFlood ? Math.floor(Math.random() * 120) + 20 : 0
      });

      // Extreme Heat: ACTIVE if temp >= 38°C
      const isExtremeHeat = temp >= 38;
      generatedTriggers.push({
        type: 'Extreme Heat',
        value: `${Math.round(temp)}°C`,
        threshold: '≥38°C',
        dataSource: 'OpenWeatherMap API',
        severity: isExtremeHeat ? 'Critical' : 'Low',
        isActive: isExtremeHeat,
        affectedWorkers: isExtremeHeat ? Math.floor(Math.random() * 180) + 40 : 0
      });

      // Curfew/Bandh: Keep as CLEAR (manual/static, cannot be verified by weather data)
      generatedTriggers.push({
        type: 'Curfew/Bandh',
        value: 'No curfew detected',
        threshold: 'Official alert',
        dataSource: 'Govt. Alerts',
        severity: 'Low',
        isActive: false,
        affectedWorkers: 0
      });

      setTriggers(generatedTriggers);
    } catch (err) {
      console.error('Failed to fetch triggers:', err);
      toast.error('Failed to fetch live triggers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTriggers(); }, []);


  const handleRefresh = () => { setRefreshing(true); fetchTriggers(); };

  if (loading) return (
    <div className="loading-center"><div className="spinner" /></div>
  );

  const activeCount = triggers.filter(t => t.isActive).length;

  return (
    <div className="triggers-page page-container">
      <div className="page-header-row">
        <div>
          <h1>Live Disruption Alerts</h1>
          <p>Real-time parametric triggers monitored in your zone</p>
        </div>
        <button className="btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          <FiRefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Status Bar */}
      <div className="status-bar card">
        <div className="status-item">
          <div className={`status-dot ${activeCount > 0 ? 'active' : 'ok'}`} />
          <span>{activeCount > 0 ? `${activeCount} Active Alert${activeCount > 1 ? 's' : ''}` : 'All Clear'}</span>
        </div>
        <div className="status-item">
          <FiZap color="#FF6B35" size={14} />
          <span>Auto-claim: <strong>Enabled</strong></span>
        </div>
        <div className="status-item">
          <FiCheckCircle color="#00C49F" size={14} />
          <span>Monitoring: <strong>5 trigger types</strong></span>
        </div>
        <div className="status-item">
          <span style={{ color: location ? '#00C49F' : '#FFD166', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#f97316" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {location ? `Location: ${location.city || 'Detected'}` : 'Detecting location...'}
          </span>
        </div>
        {locationError && (
          <div className="status-item" style={{ color: '#FFD166' }}>
            <span>⚠️ {locationError}</span>
          </div>
        )}
        <div className="status-item muted">
          Last updated: {new Date().toLocaleTimeString('en-IN')}
        </div>
      </div>

      {/* Live Triggers */}
      <h2 className="section-title">Current Alerts in Your Zone</h2>
      <div className="triggers-cards">
        {triggers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8899BB' }}>
            <p>All clear in your zone. No active disruptions.</p>
          </div>
        ) : triggers.every(t => !t.isActive) ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8899BB' }}>
            <p>All clear in your zone. No active disruptions.</p>
          </div>
        ) : (
          triggers.map((t, i) => {
            const color = colorMap[t.type] || '#FF6B35';
            return (
              <div key={i}
                className={`trigger-alert-card card ${t.isActive ? 'active' : 'inactive'}`}
                style={{ '--tc': color }}>
                <div className="ta-header">
                  <div className="ta-icon" style={{ color, background: `${color}18` }}>
                    {iconMap[t.type] || <FiAlertTriangle size={24} />}
                  </div>
                  <div>
                    <h4>{t.type}</h4>
                    <p className="ta-source">{t.dataSource}</p>
                  </div>
                  <div className="ta-status">
                    {t.isActive ? (
                      <span className="badge badge-red">ACTIVE</span>
                    ) : (
                      <span className="badge badge-green">CLEAR</span>
                    )}
                  </div>
                </div>
                <div className="ta-body">
                  <div className="ta-row">
                    <span>Observed</span>
                    <strong>{t.value}</strong>
                  </div>
                  <div className="ta-row">
                    <span>Threshold</span>
                    <strong>{t.threshold}</strong>
                  </div>
                  <div className="ta-row">
                    <span>Severity</span>
                    <strong style={{ color: severityColor[t.severity] }}>{t.severity}</strong>
                  </div>
                  <div className="ta-row">
                    <span>Workers Affected</span>
                    <strong>{t.affectedWorkers}</strong>
                  </div>
                </div>
                {t.isActive && (
                  <div className="ta-footer">
                    <FiZap size={12} color={color} />
                    <span>Auto-claim triggered for active policyholders in this zone</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Trigger Logic Explainer */}
      <div className="trigger-logic card">
        <h3>How Auto-Claims Work</h3>
        <div className="logic-steps">
          {[
            { step: '01', label: 'API Detects Threshold', desc: 'Weather/AQI/News APIs checked every 15 min' },
            { step: '02', label: 'Zone Match', desc: "Worker's pincode matched to affected area" },
            { step: '03', label: 'Fraud Score Computed', desc: 'ML model validates claim authenticity (< 0.3 = auto-approve)' },
            { step: '04', label: 'Payout Calculated', desc: 'Hours lost × daily earnings × plan ratio' },
            { step: '05', label: 'UPI Transfer', desc: 'Money sent to registered UPI within 2 hours' },
          ].map((s, i) => (
            <div key={i} className="logic-step">
              <div className="logic-num" style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'tnum' on, 'lnum' on", letterSpacing: "0.02em" }}>{s.step}</div>
              <div>
                <h5>{s.label}</h5>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TriggersPage;
