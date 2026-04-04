# 🛒 Avaran — AI-Powered Parametric Income Insurance for India's Q-Commerce Workers

> **Guidewire DEVTrails 2026 | University Hackathon**
> Protecting the livelihoods of Zepto & Blinkit delivery partners from uncontrollable external disruptions.

---

## 📌 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Persona & Scenarios](#persona--scenarios)
3. [Application Workflow](#application-workflow)
4. [Weekly Premium Model](#weekly-premium-model)
5. [Parametric Triggers](#parametric-triggers)
6. [Platform Choice: Web vs Mobile](#platform-choice-web-vs-mobile)
7. [AI/ML Integration Plan](#aiml-integration-plan)
8. [Tech Stack](#tech-stack)
9. [Development Plan](#development-plan)
10. [Team](#team)

---

## 🎯 Problem Statement

India's Q-Commerce (Quick Commerce) delivery partners working with platforms like **Zepto** and **Blinkit** operate on hyper-local, time-critical delivery cycles — often completing 20–40 deliveries per day within 10-minute delivery windows. Unlike food delivery, Q-Commerce workers operate during **extreme peak hours** and are heavily dependent on consistently being available.

External disruptions — **heavy rain, flash floods, extreme heat, AQI spikes, local curfews, or sudden strikes** — can force these workers off the road for hours or even entire days, causing them to **lose 20–30% of their weekly earnings** with zero financial protection.

**Avaran** is a parametric income insurance platform that automatically detects these disruptions and triggers instant payouts to workers — **no paperwork, no manual claims, no waiting**.

---

## 👤 Persona & Scenarios

### Primary Persona: The Q-Commerce Delivery Partner

| Attribute | Details |
|-----------|---------|
| **Name** | Raju Sharma (representative persona) |
| **Platform** | Zepto / Blinkit |
| **City** | Bengaluru / Mumbai / Delhi NCR |
| **Working Hours** | 8–12 hours/day, 6–7 days/week |
| **Avg. Weekly Earnings** | ₹3,500 – ₹6,000 |
| **Vehicle** | Two-wheeler (electric or petrol) |
| **Tech Literacy** | Moderate (uses Android smartphone daily for delivery app) |
| **Financial Profile** | No formal employment, no savings buffer, relies on weekly platform payouts |

---

### 📖 Scenario 1: Heavy Rainfall in Mumbai

> Raju is a Blinkit partner in Andheri, Mumbai. On a Tuesday afternoon, the IMD issues a Red Alert for heavy rainfall. Roads begin to flood and Blinkit temporarily suspends delivery operations in Raju's zone. He loses 5 hours of work — approximately ₹500 in earnings.
>
> **With Avaran:** The system detects rainfall > 20mm/hr from the weather API and a Blinkit zone suspension signal. An automatic claim is triggered. Within 2 hours, ₹450 is credited to Raju's UPI account — no action required from him.

---

### 📖 Scenario 2: Severe AQI Alert in Delhi

> During peak winter, Delhi's AQI crosses 400 (Severe category). The Delhi government issues a partial outdoor work restriction. Zepto partners in affected pin codes lose an entire day of income.
>
> **With Avaran:** AQI data from CPCB/OpenAQ API triggers the pollution disruption clause. All registered Avaran workers in the affected pin codes receive automatic payouts proportional to their average daily income — calculated from the last 4 weeks of activity data.

---

### 📖 Scenario 3: Sudden Local Strike / Bandh

> A surprise bandh is called in a district of Bengaluru. Roads are blocked and Zepto pauses operations for the zone. Workers lose an average of 6–8 hours.
>
> **With Avaran:** Social disruption triggers sourced from verified government/news APIs flag the affected pin codes. Claims are auto-initiated for all active policy holders in those zones.

---

## 🔄 Application Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                          AVARAN PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [1] ONBOARDING          [2] RISK PROFILING    [3] POLICY         │
│  ─────────────           ──────────────────    ──────────         │
│  • Phone number          • Zone-based risk      • Shield Advisor  │
│  • Aadhaar-lite KYC        scoring (AI model)     (AI Recs)       │
│  • Platform ID           • Historical earnings  • Premium calc    │
│    (Zepto/Blinkit)         analysis             • Savings Tracker │
│  • GPS home zone         • Disruption frequency • UPI mandate     │
│    selection               in user's area                         │
│                                                                   │
│  [4] LIVE MONITORING     [5] AUTO CLAIM         [6] PAYOUT        │
│  ───────────────────     ─────────────          ───────           │
│  • Weather APIs          • Proactive Suggest    • UPI Direct      │
│  • AQI APIs              • Visual Pipeline      • SMS notify      │
│  • Traffic/Zone APIs     • Fraud check runs     • Dashboard       │
│  • Platform status       • Worker notified                        │
│                                                                   │
│  [7] ANALYTICS DASHBOARD                                          │
│  ──────────────────────                                           │
│  Worker View: Shield Advisor, Protected income (30-day savings)   │
│  Admin View: Loss ratios, fraud flags, predictive risk map        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Weekly Premium Model

Q-Commerce workers operate on a **week-to-week earning cycle** — they receive platform payouts weekly. Avaran's pricing mirrors this exact cycle.

### Premium Tiers

| Plan | Weekly Premium | Max Weekly Payout | Coverage Events | Best For |
|------|---------------|-------------------|-----------------|----------|
| **Basic Shield** | ₹29/week | ₹800 | Weather only | New workers / low-risk zones |
| **Pro Shield** | ₹49/week | ₹1,500 | Weather + AQI + Curfew | Most workers |
| **Max Shield** | ₹79/week | ₹2,500 | All triggers + extended hours | High-earning partners |

### How Weekly Pricing Works

- **Premium is deducted every Monday** via UPI AutoPay mandate set up during onboarding.
- **Coverage week runs Monday 00:00 to Sunday 23:59**.
- If a disruption occurs mid-week, the **payout is proportional to the hours lost** within that coverage week.
- Workers can **pause or upgrade** their plan at the end of any week — no lock-in.
- **Dynamic pricing:** The AI model adjusts premium slightly (±₹5–10) based on the predicted risk for the upcoming week (e.g., a higher premium week before monsoon season peak).

### Payout Calculation Formula

```
Payout = (Hours Lost / Average Daily Hours) × Average Daily Earnings × Coverage Ratio

Where:
  Coverage Ratio = Plan Tier Multiplier (Basic: 0.5 | Pro: 0.75 | Max: 1.0)
  Average Daily Earnings = Rolling 4-week average from platform data (or self-declared)
  Hours Lost = Disruption duration within working hours (6 AM – 10 PM)
```

**Example:** Raju earns ₹700/day avg, works 10 hrs/day, is on Pro Shield. A 5-hour flood disruption:
> Payout = (5/10) × ₹700 × 0.75 = **₹262.50**

---

## ⚡ Parametric Triggers

> Parametric insurance pays out based on **objective, verifiable external data** — not subjective damage assessments. No claims form needed.

### Trigger Matrix

| # | Trigger Name | Data Source | Threshold | Payout Activation |
|---|-------------|-------------|-----------|-------------------|
| 1 | **Heavy Rainfall** | OpenWeatherMap / IMD API | > 20mm/hr OR Red Alert issued | Auto-claim for affected pin codes |
| 2 | **Flash Flood / Waterlogging** | IMD Flood API + Google Maps Traffic | 40mm/3hr OR Road closure | Auto-claim for workers in zone |
| 3 | **Extreme Heat** | OpenWeatherMap | > 38°C (Extreme Stress Threshold) | Auto-claim if platform suspends ops |
| 4 | **Severe Air Pollution** | CPCB / OpenAQ API | PM2.5 > 250 OR AQI > Level 4 | Auto-claim for affected city zones |
| 5 | **Curfew / Bandh / Strike** | Govt alerts + verified news API | Official restriction in zone | Manual review + auto-claim within 2 hrs |

### Trigger Logic

```
IF [Environmental Threshold Crossed]
  AND [Worker's GPS Zone = Affected Zone]
  AND [Active Policy = True]
  AND [Fraud Score < 0.3]
THEN → Initiate Auto-Claim → Calculate Payout → Process UPI Transfer
```

**Important:** Avaran only covers **income lost during disruptions** — not vehicle damage, health, or accidents.

---

## 📱 Platform Choice: Web or Mobile?

### Decision: **Mobile-First Progressive Web App (PWA)**

| Factor | Reasoning |
|--------|-----------|
| **Device Reality** | 95%+ of Q-Commerce workers use Android smartphones; very few use desktops |
| **Accessibility** | PWA works on low-end Android devices (₹5,000–₹8,000 phones) without app store download |
| **Offline Support** | PWA supports offline-first experience — workers can check coverage status without data |
| **UPI Integration** | Mobile-native UPI deeplinks enable seamless premium payment and payout receipt |
| **Notifications** | Push notifications for claim triggers and payout confirmations |
| **Low Friction** | No app store approval delays; instant deployment; shareable via WhatsApp link |

A native Android app (React Native) will be built for Phase 3 to support richer features like GPS-based zone detection and biometric KYC.

---

## 🤖 AI/ML Integration Plan

### 1. Dynamic Weekly Premium Engine

**Model:** Gradient Boosted Regression (XGBoost)

**Input Features:**
- Worker's operating zone (pin code level)
- Historical disruption frequency in that zone (last 6 months)
- Seasonal risk index (monsoon probability, winter AQI trends)
- Worker's claim history (claims-to-premium ratio)
- Upcoming week's weather forecast (7-day)

**Output:** Personalized weekly premium (within tier range) with explainability score

**Training Data:** IMD historical weather records, CPCB AQI archives, OpenStreetMap flood zone data

---

### 2. Intelligent Fraud Detection System

**Model:** Isolation Forest + Rule-Based Anomaly Detector

**Fraud Signals Monitored:**
- GPS location doesn't match claimed disruption zone
- Worker claims disruption but platform data shows active deliveries during the same period
- Multiple claims filed in the same household / same device ID
- Claim filed for a trigger that didn't meet threshold in the worker's specific pin code
- Sudden spike in claim frequency after plan upgrade

**Risk Scoring:**
```
Fraud Score = weighted_avg(
  location_mismatch_score × 0.35,
  platform_activity_score × 0.30,
  duplicate_signal_score × 0.20,
  behavioral_anomaly_score × 0.15
)
```
- Score < 0.3 → Auto-approve
- Score 0.3–0.6 → Flag for soft review (auto-approved within 4 hrs unless escalated)
- Score > 0.6 → Hold for manual review

---

### 3. Risk Profiling at Onboarding

**Model:** K-Means Clustering + Logistic Risk Classifier

Workers are clustered into risk profiles at onboarding based on:
- Pin code disruption history
- Declared working hours
- Platform (Zepto vs Blinkit operational patterns differ)
- Time of year (pre-monsoon vs winter)

This risk profile determines their initial premium band and recommended plan.

---

### 4. Predictive Disruption Forecasting (Admin Dashboard)

**Model:** LSTM Time-Series Forecasting

- Predicts likelihood of disruption events in the next 7 days per zone
- Helps insurer pre-position reserve funds
- Feeds back into next week's dynamic premium calculation

---

## 🛠 Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| UI Framework | React.js (Vite PWA) |
| Mobile App (Phase 3) | React Native |
| Styling | Tailwind CSS |
| Maps / Zone Visualization | Leaflet.js + OpenStreetMap |
| Charts | Recharts |

### Backend
| Layer | Technology |
|-------|-----------|
| API Server | Node.js + Express.js |
| Auth & Security | JWT + **Zod Payload Strict Validation** |
| Database | MongoDB + Mongoose |
| Application Structure | Single Monorepo with Concurrent Execution |

### AI/ML
| Component | Technology |
|-----------|-----------|
| Premium Engine | Python + XGBoost + FastAPI |
| Fraud Detection | Python + Scikit-learn (Isolation Forest) |
| Forecasting | Python + TensorFlow (LSTM) |
| Model Serving | FastAPI microservice |

### External APIs & Integrations
| Integration | Purpose | Mode |
|-------------|---------|------|
| OpenWeatherMap API | Real-time weather + forecasts | Free tier |
| CPCB / OpenAQ API | AQI monitoring | Free/Public |
| IMD Open Data | Official flood/alert triggers | Public |
| Razorpay (Test Mode) | Premium collection + UPI payout | Sandbox |
| Platform API (Zepto/Blinkit) | Earnings verification, active status | Simulated mock |

### DevOps
| Layer | Technology |
|-------|-----------|
| Hosting | Vercel (frontend) + Railway (backend) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + Logtail |
| Containerization | Docker |

---

## 📅 Development Plan

### Phase 1 — Ideation & Foundation (March 4–20) ✅
- [x] Problem research and persona definition
- [x] Weekly premium model design
- [x] Parametric trigger matrix finalization
- [x] Tech stack selection
- [x] Repository setup and README
- [x] Wireframes for onboarding and dashboard
- [x] 2-minute strategy video

### Phase 2 — Automation & Protection (March 21 – April 4) ✅
- [x] Worker onboarding flow (phone OTP + KYC + platform ID)
- [x] Policy creation with dynamic premium calculation
- [x] 5 parametric trigger integrations (Weather, AQI, Curfew)
- [x] Auto-claim initiation engine
- [x] Fraud detection v1 (rule-based)
- [x] Basic worker dashboard
- [x] Single-repo Vite frontend & Express backend optimization
- [x] Strict Zod payload validation across all API endpoints

### Phase 3 — Scale & Optimise (April 5–17)
- [ ] ML-powered fraud detection (Isolation Forest)
- [ ] Dynamic premium ML model (XGBoost)
- [ ] Instant UPI payout simulation
- [ ] Admin/Insurer analytics dashboard
- [ ] LSTM disruption forecasting for admin
- [ ] React Native mobile app (basic)
- [ ] Full QA and load testing
- [ ] 5-minute final demo video
- [ ] Final pitch deck (PDF)

---

## 🏗 Architecture Diagram

```
                          ┌──────────────────┐
                          │   WORKER (PWA)   │
                          │ React.js Mobile  │
                          └────────┬─────────┘
                                   │ HTTPS
                          ┌────────▼─────────┐
                          │   API GATEWAY    │
                          │  Node.js/Express │
                          └──┬──────────┬────┘
                             │          │
               ┌─────────────▼──┐  ┌────▼──────────────┐
               │  POLICY ENGINE │  │  TRIGGER MONITOR  │
               │  PostgreSQL    │  │  Redis + BullMQ   │
               └────────────────┘  └────────┬──────────┘
                                            │
                        ┌───────────────────▼──────────────────┐
                        │         EXTERNAL DATA SOURCES         │
                        │  OpenWeatherMap | CPCB | IMD | Maps   │
                        └───────────────────┬──────────────────┘
                                            │
                        ┌───────────────────▼──────────────────┐
                        │           AI/ML MICROSERVICE          │
                        │  FastAPI | XGBoost | Isolation Forest │
                        └───────────────────┬──────────────────┘
                                            │
                        ┌───────────────────▼──────────────────┐
                        │           PAYOUT ENGINE               │
                        │      Razorpay Sandbox / UPI Mock      │
                        └──────────────────────────────────────┘
```

---

## 🔗 Important Links

- 📁 **Detailed Setup Guide:** [Setup Guide (SETUP.md)](SETUP.md)
- 📝 **Phase 2 Implementation Details:** [Deliverables Breakdown (PHRASE_1.md)](PHRASE_1.md)
- 📁 **GitHub Repository:** `[https://github.com/ManishSamanta23/Avaran]`
- 🎥 **Phase 1 Strategy Video:** [Watch Here][def]

---

## 👥 Infinity Coders

| Name | Role |
|------|------|
| [Arnab Dey] | Full Stack Developer |
| [Premal Bhagat] | AI/ML Engineer |
| [Manish Samanta] | UI/UX + Frontend + Backend |
---

## ⚠️ Coverage Exclusions (As per hackathon constraints)

Avaran **strictly excludes** the following — these are not insurable events under this platform:
- ❌ Vehicle repair or damage
- ❌ Health, medical, or accident insurance
- ❌ Life insurance or death benefits
- ❌ Income lost due to worker's own unavailability (sick leave, personal reasons)

Avaran **only covers** verifiable, objective, external disruptions that cause loss of income.

---

*Built with ❤️ for India's 15M+ gig workers | Guidewire DEVTrails 2026*


[def]: https://www.dropbox.com/scl/fi/akyn04zrge330e0di3sp3/Avaran-Project.mp4?rlkey=c9m3uy0njwtuoox48idtwmotx&st=2k3vnwe0&dl=0