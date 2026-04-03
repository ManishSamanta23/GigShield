# 🛡️ Avaran — MERN Stack Setup Guide

This project features a strictly validated API architecture powered by Zod, a high-performance React frontend built with Vite, and a standard Express backend, all managed from a single root monorepo.

## Project Structure

```
avaran/
├── backend/                 # Node.js + Express Backend
│   ├── index.js             # Entry point
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Mongoose models
│   │   ├── Worker.js
│   │   ├── Policy.js
│   │   ├── Claim.js
│   │   └── Trigger.js
│   ├── routes/              # Zod Validated API routes
│   │   ├── auth.js
│   │   ├── workers.js
│   │   ├── policies.js
│   │   ├── claims.js
│   │   ├── triggers.js
│   │   └── analytics.js
│   └── middleware/
│       └── auth.js          # JWT middleware
│
├── frontend/                # Vite + React Frontend
│   ├── index.html           # Vite Entry Point
│   └── src/
│       ├── App.jsx
│       ├── index.jsx
│       ├── index.css        # Global styles & design system
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   └── api.js       # Axios setup with auth tracking
│       ├── components/
│       │   └── Navbar/
│       └── pages/
│           ├── LandingPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── PolicyPage.jsx
│           ├── ClaimsPage.jsx
│           ├── UpgradePage.jsx
│           └── TriggersPage.jsx
│
├── package.json             # Central configuration (runs both Vite and Node)
├── vite.config.js           # Vite configuration defining frontend build rules
├── .env                     # Local environment keys (not tracked)
└── .gitignore               # Ignored files (node_modules, build/)
```

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas connection)

### 2. Clone & Install
Because of the monorepo structure, a single install populates everything.
```bash
git clone <your-repo>
cd avaran
npm install
```

### 3. Environment Setup
Create a `.env` file at the root.
```bash
# Add your local variables:
MONGO_URI=mongodb://localhost:27017/avaran
JWT_SECRET=your_secret_key_here
```

### 4. Run Development
Thanks to Vite and Concurrently, the frontend and backend run seamlessly together via one command.
```bash
npm run dev
```
* **Frontend:** Loads extremely fast using Vite (`http://localhost:3000` or `5173`).
* **Backend:** Nodemon actively monitors the API securely passing Zod validation (`http://localhost:5000`).

### 5. Run Production Build
Ready to deploy? Build the unified project.
```bash
npm run build
npm run start
```

## Secure API Endpoints

Our backend strictly enforces all incoming payload structures using **Zod Validation Schema**. Required fields (e.g. `hoursLost`) are securely coerced, bounds-checked (`max: 24`), and cleansed before processing.  

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register worker (Zod schema checking) |
| POST | /api/auth/login | Login with JWT Token generation |
| GET  | /api/workers/profile | Get logged-in user profile |
| PUT  | /api/workers/profile | Update profile (Zod schema checking) |
| POST | /api/policies | Purchase Plan (Zod `plan` Enum checking) |
| PUT  | /api/policies/my/upgrade| In-place upgrade active plan |
| GET  | /api/policies/my | Fetch active policies |
| POST | /api/claims | Submit claim (Zod numerical coercion limits) |
| GET  | /api/claims/my | Get claim history |
| POST | /api/triggers/simulate | Sandbox trigger simulator |

## Tech Stack
- **Frontend:** React 18, Vite (PWA optimization ready), React Router v6
- **Backend:** Node.js, Express.js (Rest API)
- **Validation:** Zod Payload Validation Ecosystem
- **Database:** MongoDB + Mongoose (Document DB)
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay Sandbox ready (Phase 3)
