import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiMapPin, FiDatabase } from 'react-icons/fi';
import api from '../utils/api';
import { getCurrentLocation } from '../utils/geolocation';
import toast from 'react-hot-toast';
import './ClaimsPage.css';

const TRIGGERS = ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'];

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    triggerType: 'Heavy Rainfall', 
    triggerValue: '', 
    hoursLost: 3,
    latitude: null,
    longitude: null,
    locationStatus: 'Not captured',
    locationName: null,
    accuracy: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/claims/my').then(r => { setClaims(r.data); setLoading(false); });
  }, []);

  // Capture geolocation when form opens
  useEffect(() => {
    if (showForm) {
      captureLocation();
    }
  }, [showForm]);

  const captureLocation = async () => {
    try {
      setForm(prev => ({ ...prev, locationStatus: 'Capturing...' }));
      const location = await getCurrentLocation();
      
      // Format location display
      let locationDisplay = '✓ Captured';
      if (location.locationName) {
        locationDisplay = `✓ ${location.locationName}`;
      }
      
      setForm(prev => ({ 
        ...prev, 
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.locationName,
        accuracy: location.accuracy,
        locationStatus: locationDisplay
      }));
      toast.success('Location captured for auto-validation');
    } catch (err) {
      setForm(prev => ({ ...prev, locationStatus: '✗ Failed to capture location' }));
      toast.error('Could not capture location. Manual review will be required.');
      console.error('Geolocation error:', err);
    }
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Remove UI-only fields before submitting
      const { locationStatus, locationName, accuracy, ...claimData } = form;
      
      const { data } = await api.post('/claims', claimData);
      
      // Create claim object that includes the full response
      const claimWithDetails = data.claim || data;
      setClaims([claimWithDetails, ...claims]);
      setShowForm(false);
      
      // Display different messages based on auto-approval
      if (data.autoApprovalDetails?.auto_approved) {
        toast.success(
          `✅ Claim auto-approved based on real-time API data!\n₹${claimWithDetails.payoutAmount} will be sent to your UPI 🎉`,
          { duration: 5 }
        );
      } else {
        toast.success(
          `Claim submitted for review using real-time ${data.autoApprovalDetails?.api_used || 'API'} data.`,
          { duration: 5 }
        );
      }
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
          <p className="form-note">
            <FiDatabase size={14} style={{ marginRight: '4px' }} />
            Claims are auto-validated against live weather/AQI API data
          </p>
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
                <label>Observed Value (Reference Only)</label>
                <input placeholder="e.g. AQI 380, Temp 46°C (for your records only)"
                  value={form.triggerValue}
                  onChange={e => setForm({ ...form, triggerValue: e.target.value })} />
                <small style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                  Note: This is for reference. Approval is based on real API data only.
                </small>
              </div>
              <div className="input-group">
                <label>Hours Lost</label>
                <input type="number" min="1" max="24" value={form.hoursLost}
                  onChange={e => setForm({ ...form, hoursLost: parseInt(e.target.value) })} required />
              </div>
            </div>

            {/* Geolocation Status */}
            <div className="location-status" style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: form.locationStatus.includes('✓') ? '#2E7D32' : 
                          form.locationStatus.includes('✗') ? '#C62828' : '#1565C0',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FFFFFF',
              fontWeight: '500'
            }}>
              <FiMapPin size={20} color="#FFFFFF" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>DETECTED LOCATION</span>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                  {form.locationStatus.includes('✓') && form.locationName 
                    ? form.locationName 
                    : form.locationStatus.includes('✓') 
                    ? 'Location detected'
                    : form.locationStatus}
                </span>
                {form.locationStatus.includes('✓') && form.accuracy && (
                  <span style={{ fontSize: '12px', opacity: 0.85, fontWeight: '400' }}>
                    ±{Math.round(form.accuracy)}m accuracy
                  </span>
                )}
              </div>
              {!form.locationStatus.includes('✓') && !form.locationStatus.includes('Capturing') && (
                <button 
                  type="button" 
                  onClick={captureLocation}
                  style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                  className="btn-secondary"
                >
                  Retry
                </button>
              )}
            </div>

            <div className="claim-note">
              <FiAlertCircle size={14} color="#FFD166" />
              <span>GigShield covers income loss only. Vehicle damage and health costs are excluded.</span>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting || !form.latitude}>
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
            <span>Details</span>
          </div>
          {claims.map(c => {
            const s = statusConfig[c.status] || statusConfig['Pending'];
            const autoApprovalDetails = c.autoApprovalDetails;
            return (
              <div className="table-row" key={c._id} style={{ cursor: 'pointer' }}>
                <span className="col-trigger">{c.triggerType}</span>
                <span className="col-muted">{new Date(c.claimDate).toLocaleDateString('en-IN')}</span>
                <span>{c.hoursLost} hrs</span>
                <span className="col-amount">₹{c.payoutAmount}</span>
                <span><span className={`badge badge-${s.badge}`}>{s.label}</span></span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {autoApprovalDetails?.api_used ? (
                    <span 
                      title={autoApprovalDetails?.decision_reason}
                      style={{
                        color: autoApprovalDetails.auto_approved ? '#28C76F' : '#EA5455',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {autoApprovalDetails.auto_approved ? '✔' : '🚫'}
                      {autoApprovalDetails.auto_approved ? 'Auto Approved' : 'Weather data not matched'}
                    </span>
                  ) : (
                    <span style={{
                      color: c.fraudScore >= 0.2 ? '#EA5455' : '#28C76F',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {c.fraudScore >= 0.2 ? '🚫' : '✔'} 
                      {c.fraudScore >= 0.2 ? 'High fraud risk' : `Fraud Score: ${(c.fraudScore * 100).toFixed(0)}%`}
                    </span>
                  )}
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
