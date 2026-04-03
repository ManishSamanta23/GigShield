# Phase 2 Deliverables: Implementation Details

This document explains in detail how the 4 core points from the Phase 2 deliverables ("Automation & Protection") are utilized and executed within the Avaran platform.

## 1. Registration Process
The registration process is crucial for not only authenticating the Q-Commerce delivery partner but also initializing their baseline risk profile.
* **How it works:** When a worker signs up via the frontend (`frontend/src/pages/RegisterPage.jsx`), they submit critical details including their `platform`, `city`, and typical `working hours/earnings`.
* **Security & Profiling:** The backend API (`backend/routes/auth.js`) actively validates these payloads using strict **Zod schemas**. More importantly, the system assigns an immediate `riskScore` and `riskZone` (High/Medium/Low) based on the worker's city. For example, a worker from Mumbai receives a High risk score (`0.8`) due to historical flooding, while a worker from Bengaluru receives a Medium score (`0.55`). The worker is then issued a secure JWT session token containing these variables.

## 2. Insurance Policy Management
The policy management system is the core self-service portal for workers to manage their parametric insurance coverage.
* **How it works:** Our React frontend (`PolicyPage.jsx`, `UpgradePage.jsx`) provides a seamless interface connected to our Express backend (`backend/routes/policies.js`). 
* **Shield Advisor & Savings Tracker:** The dashboard now includes:
  * **Shield Advisor:** An AI-driven advisor that analyzes weather forecasts and suggests plan upgrades (e.g., suggesting a Max Shield in Mumbai during monsoon predictions).
  * **Cumulative Savings Tracker:** A real-time analytics card that sums up all income recovered (payouts paid) in the last 30 days to reinforce platform value.
  * **Pause/Resume:** The system allows workers to securely `Pause` their coverage if they are off duty, freezing their premiums instantly.
  * **Upgrade:** In-place upgrades dynamically adjust their MongoDB policy document, expanding coverage instantly.

## 3. Dynamic Premium Calculation
To satisfy the "AI Integration Example", the platform natively dynamically scales insurance premiums based on hyper-local risk assessment.
* **How it works:** Instead of hard-coding the weekly fees, the system pulls the worker's secure `riskScore` acquired during Registration.
* **The Engine:** In both the `PolicyPage.jsx` UI render and the backend purchase routes, a specialized pricing algorithm `calculatePremium(base, riskScore)` runs. The calculation adjusts the base pricing around a median score (0.55).
* **The Result:** If a significantly low-risk worker (`0.30`) browses the plans, they are automatically offered a customized **₹10/week discount**. Conversely, a high-risk worker (`0.80` from Mumbai) sees a **₹10/week surcharge**. The price they see is perfectly localized to them, making the platform financially viable while adhering to the hackathon's "Dynamic Pricing Modelling" constraint perfectly.

## 4. Claims Management (Zero-Touch Automation)
Parametric insurance requires that workers do not spend hours filling out manual damage forms. Avaran has evolved to a fully automated, data-driven validation system.
* **Proactive Prediction & Visual Pipeline:** The Claims Management system now features:
  * **Proactive Suggestions:** The platform monitors live environmental conditions and sends "Automatic Claims Alerts" if a disruption is detected in the worker's zone, pre-filling the claim for them.
  * **Visual Validation Stepper:** A multi-step UI that demonstrates the "Parametric Engine" at work—capturing GPS, querying OpenWeatherMap APIs, analyzing thresholds, and initiating payouts in real-time.
  * **Recalibrated Thresholds:** The `autoApprovalEngine.js` uses hyper-realistic thresholds (e.g., Rainfall > 20mm/hr, Heat > 38°C, AQI > Level 4) calibrated for Indian urban gig worker safety.
  * **The Result:** If API validation passes and fraud risk is low, the claim is instantly **`Auto-Approved`**, triggering an immediate UPI payout transaction without human intervention.
