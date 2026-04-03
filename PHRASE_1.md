# Phase 2 Deliverables: Implementation Details

This document explains in detail how the 4 core points from the Phase 2 deliverables ("Automation & Protection") are utilized and executed within the GigShield platform.

## 1. Registration Process
The registration process is crucial for not only authenticating the Q-Commerce delivery partner but also initializing their baseline risk profile.
* **How it works:** When a worker signs up via the frontend (`frontend/src/pages/RegisterPage.jsx`), they submit critical details including their `platform`, `city`, and typical `working hours/earnings`.
* **Security & Profiling:** The backend API (`backend/routes/auth.js`) actively validates these payloads using strict **Zod schemas**. More importantly, the system assigns an immediate `riskScore` and `riskZone` (High/Medium/Low) based on the worker's city. For example, a worker from Mumbai receives a High risk score (`0.8`) due to historical flooding, while a worker from Bengaluru receives a Medium score (`0.55`). The worker is then issued a secure JWT session token containing these variables.

## 2. Insurance Policy Management
The policy management system is the core self-service portal for workers to manage their parametric insurance coverage.
* **How it works:** Our React frontend (`PolicyPage.jsx`, `UpgradePage.jsx`) provides a seamless interface connected to our Express backend (`backend/routes/policies.js`). 
* **Worker Capabilities:** Workers can effortlessly:
  * **View Plans:** Browse the curated Basic, Pro, and Max shields.
  * **Pause/Resume:** The system allows workers to securely `Pause` their coverage if they are off duty, flipping the MongoDB status away from `Active` to freeze their premiums.
  * **Upgrade:** In-place upgrades dynamically adjust their MongoDB policy document, expanding their `coverageEvents` array and increasing their maximum payout limit instantly.

## 3. Dynamic Premium Calculation
To satisfy the "AI Integration Example", the platform natively dynamically scales insurance premiums based on hyper-local risk assessment.
* **How it works:** Instead of hard-coding the weekly fees, the system pulls the worker's secure `riskScore` acquired during Registration.
* **The Engine:** In both the `PolicyPage.jsx` UI render and the backend purchase routes, a specialized pricing algorithm `calculatePremium(base, riskScore)` runs. The calculation adjusts the base pricing around a median score (0.55).
* **The Result:** If a significantly low-risk worker (`0.30`) browses the plans, they are automatically offered a customized **₹10/week discount**. Conversely, a high-risk worker (`0.80` from Mumbai) sees a **₹10/week surcharge**. The price they see is perfectly localized to them, making the platform financially viable while adhering to the hackathon's "Dynamic Pricing Modelling" constraint perfectly.

## 4. Claims Management (Zero-Touch Automation)
Parametric insurance requires that workers do not spend hours filling out manual damage forms. GigShield has evolved to a fully automated, data-driven validation system.
* **How it works:** The Claims Dashboard is designed for a frictionless, zero-touch experience. A worker selects an active claim event and submits their hours lost.
* **Geolocation & Real-Time Data:** The frontend (`frontend/src/pages/ClaimsPage.jsx`) now captures the worker's precise **GPS coordinates** at the time of claim. This data is passed to the backend for verification.
* **The Payout Formula:** The `backend/routes/claims.js` instantly calculates their exact payout based on their registered average earnings and specific plan ratio capping it to safe maximums.
* **Auto-Approval Safety Engine:** The platform now features a sophisticated `autoApprovalEngine.js` that connects to **OpenWeatherMap APIs**. It fetches real-time weather, precipitation, and AQI data for the worker's exact coordinates. 
* **The Result:** If the external API data (e.g., rainfall > 20mm/hr or AQI > Level 4) confirms the disruption and the `getFraudScore()` logic remains low (e.g., < 0.2), the claim is instantly transitioned to **`Auto-Approved`** status. This eliminates bureaucratic manual reviews entirely and initiates a direct UPI payout transaction. If API data cannot verify the claim, it safely fails over to a manual review status.
