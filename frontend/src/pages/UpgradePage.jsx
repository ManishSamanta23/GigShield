import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './UpgradePage.css';

const PLAN_DETAILS = {
  basic: {
    key: 'basic',
    apiPlan: 'Basic',
    name: 'Basic Shield',
    weeklyPrice: 29,
    maxPayout: 800,
  },
  max: {
    key: 'max',
    apiPlan: 'Max',
    name: 'Max Shield',
    weeklyPrice: 79,
    maxPayout: 2500,
  },
  pro: {
    key: 'pro',
    apiPlan: 'Pro',
    name: 'Pro Shield',
    weeklyPrice: 49,
    maxPayout: 1500,
  },
};

const calculatePremium = (base, riskScore) => {
  if (riskScore == null) return base;
  return base + Math.round((riskScore - 0.55) * 40);
};

const UpgradePage = () => {
  const { worker } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const selectedPlan = useMemo(() => {
    const planKey = (searchParams.get('plan') || '').toLowerCase();
    const planDetail = PLAN_DETAILS[planKey] || PLAN_DETAILS.basic;
    return {
      ...planDetail,
      weeklyPrice: calculatePremium(planDetail.weeklyPrice, worker?.riskScore)
    };
  }, [searchParams, worker?.riskScore]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await api.put('/policies/my/upgrade', { plan: selectedPlan.apiPlan });
      toast.success(`Plan updated to ${selectedPlan.name}`);
      navigate('/policy');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="upgrade-page page-container">
      <div className="upgrade-header">
        <h1>Upgrade Plan</h1>
        <p>Review your selected protection plan before confirming payment.</p>
      </div>

      <div className="upgrade-summary card">
        <h2>{selectedPlan.name}</h2>
        <p className="upgrade-summary-price">₹{selectedPlan.weeklyPrice}/week</p>
        <p className="upgrade-summary-payout">Max payout: ₹{selectedPlan.maxPayout.toLocaleString()}</p>
      </div>

      <div className="upgrade-payment card">
        <h3>Confirmation & Payment</h3>
        <div className="upgrade-payment-line">
          <span>Selected plan</span>
          <strong>{selectedPlan.name}</strong>
        </div>
        <div className="upgrade-payment-line">
          <span>Weekly charge</span>
          <strong>₹{selectedPlan.weeklyPrice}</strong>
        </div>
        <div className="upgrade-payment-line">
          <span>Max weekly payout</span>
          <strong>₹{selectedPlan.maxPayout.toLocaleString()}</strong>
        </div>
        <button className="btn-primary upgrade-confirm-btn" onClick={handleConfirm} disabled={confirming}>
          {confirming ? 'Processing...' : `Confirm & Switch to ${selectedPlan.name}`}
        </button>
      </div>

      <button className="btn-outline-orange" onClick={() => navigate('/policy')}>
        Back to My Policy
      </button>
    </div>
  );
};

export default UpgradePage;
