import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiTrendingUp, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { WiRain, WiSmog, WiThermometer } from 'react-icons/wi';
import './LandingPage.css';
import ShieldIcon from '../components/ShieldIcon';

const LandingPage = () => {
  const plans = [
    { name: 'Basic', price: 29, payout: 800, color: '#63B3ED',
      events: ['Heavy Rainfall', 'Flash Flood'] },
    { name: 'Pro', price: 49, payout: 1500, color: '#FF6B35', popular: true,
      events: ['Heavy Rainfall', 'Flash Flood', 'Severe AQI', 'Curfew/Bandh'] },
    { name: 'Max', price: 79, payout: 2500, color: '#00C49F',
      events: ['All triggers', 'Extended hours', 'Priority payout'] },
  ];

  const triggers = [
    { icon: <WiRain size={32} />, label: 'Heavy Rainfall', threshold: '> 35mm/hr', color: '#63B3ED' },
    { icon: <WiThermometer size={32} />, label: 'Extreme Heat', threshold: '> 45°C', color: '#FF6B35' },
    { icon: <WiSmog size={32} />, label: 'Severe AQI', threshold: '> 350', color: '#A78BFA' },
    { icon: <ShieldIcon />, label: 'Flash Flood', threshold: 'Zone closure', color: '#00C49F' },
    { icon: <FiZap size={24} />, label: 'Curfew/Bandh', threshold: 'Official alert', color: '#FFD166' },
  ];

  const steps = [
    { num: '01', title: 'Sign Up in 60s', desc: 'Phone number + Zepto/Blinkit ID. No paperwork.' },
    { num: '02', title: 'Pick Weekly Plan', desc: 'Starting at ₹29/week. Cancel anytime.' },
    { num: '03', title: 'AI Monitors 24/7', desc: 'Weather, AQI, curfews tracked in real-time.' },
    { num: '04', title: 'Instant UPI Payout', desc: 'Disruption detected → money in your account in 2 hrs.' },
  ];

  return (
    <div className="landing">

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="page-container hero-inner">
          <div className="hero-badge fade-up">
            <span className="dot" />
            Guidewire DEVTrails 2026
          </div>
          <h1 className="hero-title fade-up">
            Your income,<br />
            <span className="highlight">protected.</span>
          </h1>
          <p className="hero-subtitle fade-up">
            India's first AI-powered parametric insurance for Zepto & Blinkit delivery partners.
            Floods, AQI alerts, curfews — when disruptions stop your work, we pay automatically.
          </p>
          <div className="hero-actions fade-up">
            <Link to="/register" className="btn-primary">
              Get Protected Now <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
          <div className="hero-stats fade-up">
            <div className="stat"><strong>15M+</strong><span>Gig Workers</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>₹29</strong><span>Per Week</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>2 hrs</strong><span>Auto Payout</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>5</strong><span>Trigger Types</span></div>
          </div>
        </div>
      </section>

      {/* Triggers */}
      <section className="section">
        <div className="page-container">
          <div className="section-header">
            <h2>What We Cover</h2>
            <p>5 real-time parametric triggers — all verified by public APIs</p>
          </div>
          <div className="triggers-grid">
            {triggers.map((t, i) => (
              <div className="trigger-card card" key={i} style={{ '--accent': t.color }}>
                <div className="trigger-icon" style={{ color: t.color }}>{t.icon}</div>
                <h4>{t.label}</h4>
                <p style={{ fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'tnum' on, 'lnum' on", letterSpacing: "0.02em" }}>{t.threshold}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-dark">
        <div className="page-container">
          <div className="section-header">
            <h2>How Avaran Works</h2>
            <p>Zero forms. Zero waiting. Fully automated.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num" style={{ fontFamily: "'Inter', sans-serif !important", fontSize: "inherit", fontWeight: "inherit", color: "inherit", fontFeatureSettings: "'tnum' on", letterSpacing: "0.05em", textDecoration: "none" }}>{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section">
        <div className="page-container">
          <div className="section-header">
            <h2>Simple Weekly Plans</h2>
            <p>Priced to match how gig workers earn — week to week</p>
          </div>
          <div className="plans-grid">
            {plans.map((p, i) => (
              <div className={`plan-card card ${p.popular ? 'popular' : ''}`} key={i}>
                {p.popular && <div className="popular-tag">Most Popular</div>}
                <h3 style={{ color: p.color }}>{p.name} Shield</h3>
                <div className="plan-price">
                  <strong>₹{p.price}</strong>
                  <span>/week</span>
                </div>
                <div className="plan-payout">Up to ₹{p.payout.toLocaleString()} payout</div>
                <ul className="plan-features">
                  {p.events.map((e, j) => (
                    <li key={j}><FiCheckCircle style={{ color: p.color }} /> {e}</li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Choose {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="page-container">
          <div className="cta-box card">
            <FiTrendingUp size={48} color="#FF6B35" />
            <h2>Start protecting your income today</h2>
            <p>Join thousands of Q-Commerce workers who never lose a rupee to disruptions</p>
            <Link to="/register" className="btn-primary">
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="page-container">
          <div className="footer-logo">
            <ShieldIcon color="#FF6B35" />
            <span>Avar<strong>an</strong></span>
          </div>
          <p>Built for India's invisible workforce · Guidewire DEVTrails 2026</p>
          <p className="footer-note">
            Coverage: Income loss only · Excludes health, vehicle, accidents
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
