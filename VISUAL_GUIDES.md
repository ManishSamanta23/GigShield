# 📊 Auto-Approval System: Visual Guides

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    FRONTEND USER INTERFACE                      │
│                    (ClaimsPage.jsx)                            │
│                                                                  │
│  ┌────────────────────────────────────────┐                     │
│  │  User submits claim:                   │                     │
│  │  - Disruption Type (dropdown)          │                     │
│  │  - Hours Lost (input)                  │                     │
│  │  - Observed Value (optional)           │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │ Auto-capture GPS Coordinates          │                     │
│  │ • Request browser geolocation         │                     │
│  │ • Show "✓ Captured" status            │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  Send to Backend:                      │                     │
│  │  {                                     │                     │
│  │    triggerType: "Heavy Rainfall",     │                     │
│  │    hoursLost: 3,                      │                     │
│  │    triggerValue: "Heavy rain",        │                     │
│  │    latitude: 28.6139,                 │                     │
│  │    longitude: 77.2090                 │                     │
│  │  }                                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        │ HTTPS POST /api/claims
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                   BACKEND PROCESSING                           │
│              (routes/claims.js)                                │
│                                                                  │
│  ┌────────────────────────────────────────┐                     │
│  │  1. Validate Input                     │                     │
│  │  ├─ Schema validation (zod)           │                     │
│  │  ├─ Required fields present           │                     │
│  │  └─ Type conversions                  │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  2. Business Logic Checks              │                     │
│  │  ├─ Policy exists?                    │                     │
│  │  ├─ Coverage includes trigger?        │                     │
│  │  ├─ Calculate payout amount           │                     │
│  │  └─ Calculate fraud score             │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│        ┌──────────────┴──────────────┐                          │
│        │                             │                          │
│        ▼                             ▼                          │
│  No Geolocation?          Continue with API Validation         │
│  → Under Review            (Fraud score < 0.2)                 │
│                                     │                          │
│                                     ▼                          │
│  ┌────────────────────────────────────────┐                     │
│  │  3. Call Auto-Approval Engine         │                     │
│  │  validateClaimAgainstRealData(        │                     │
│  │    "Heavy Rainfall",                  │                     │
│  │    28.6139,                           │                     │
│  │    77.2090                            │                     │
│  │  )                                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│          AUTO-APPROVAL ENGINE                                  │
│    (utils/autoApprovalEngine.js)                               │
│                                                                  │
│  ┌────────────────────────────────────────┐                     │
│  │  1. Normalize Disruption Type          │                     │
│  │  "Heavy Rainfall" → confirmed          │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  2. Route to Specific Validator        │                     │
│  │  ├─ Heavy Rainfall                    │                     │
│  │  ├─ Flash Flood                       │                     │
│  │  ├─ Extreme Heat                      │                     │
│  │  ├─ Cyclone                           │                     │
│  │  └─ Air Pollution                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│              For "Heavy Rainfall":                             │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  3. Fetch Real-Time API Data           │                     │
│  │  fetchWeatherData(28.6139, 77.2090)   │                     │
│  │                                        │                     │
│  │  Returns:                              │                     │
│  │  {                                     │                     │
│  │    temp: 28.5,                        │                     │
│  │    rainfall_1h: 65.2,  ← KEY DATA     │                     │
│  │    weather_condition: "heavy rain",   │                     │
│  │    ...                                │                     │
│  │  }                                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  4. Compare with Threshold             │                     │
│  │                                        │                     │
│  │  Actual Value: 65.2 mm                 │                     │
│  │  Threshold:    50 mm                   │                     │
│  │                                        │                     │
│  │  Decision Logic:                       │                     │
│  │  if (65.2 >= 50) {                    │                     │
│  │    auto_approved = true                │                     │
│  │  } else {                              │                     │
│  │    auto_approved = false               │                     │
│  │  }                                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  5. Return Validation Result           │                     │
│  │  {                                     │                     │
│  │    success: true,                      │                     │
│  │    auto_approved: true,  ← DECISION    │                     │
│  │    decision_reason: "Threshold met",  │                     │
│  │    validation_data: {                  │                     │
│  │      actual_value: 65.2,               │                     │
│  │      threshold: 50,                    │                     │
│  │      api_used: "Weather API"           │                     │
│  │    }                                   │                     │
│  │  }                                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│         BACK TO BACKEND: APPLY DECISION                        │
│                                                                  │
│  ┌────────────────────────────────────────┐                     │
│  │  If auto_approved === true              │                     │
│  │  ├─ status = "Auto-Approved"           │                     │
│  │  ├─ Generate Transaction ID            │                     │
│  │  └─ Mark for immediate payout          │                     │
│  │                                        │                     │
│  │  Else                                   │                     │
│  │  ├─ status = "Under Review"            │                     │
│  │  └─ Queue for manual review            │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  Save Claim to Database                │                     │
│  │  ├─ All claim details                  │                     │
│  │  ├─ Complete autoApprovalDetails       │                     │
│  │  ├─ Full audit trail                   │                     │
│  │  └─ Timestamp                          │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  Return Response to Frontend           │                     │
│  │  {                                     │                     │
│  │    status: "Auto-Approved",            │                     │
│  │    payoutAmount: 500,                  │                     │
│  │    autoApprovalDetails: {...}          │                     │
│  │  }                                     │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│               FRONTEND: DISPLAY RESULT                         │
│                                                                  │
│  ┌────────────────────────────────────────┐                     │
│  │  Auto-Approved? → Show Green Badge     │                     │
│  │  ✅ AUTO-APPROVED                       │                     │
│  │                                        │                     │
│  │  Under Review? → Show Yellow Badge     │                     │
│  │  ⚠️ UNDER REVIEW                        │                     │
│  │                                        │                     │
│  │  Show Validation Details:              │                     │
│  │  "Validated using Weather API"         │                     │
│  │  "Rainfall: 65.2 mm (Threshold: 50)"  │                     │
│  └────────────────────┬───────────────────┘                     │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────┐                     │
│  │  Toast Notification to User            │                     │
│  │  "✅ Claim auto-approved! ₹500 will    │                     │
│  │   be sent to your UPI 🎉"              │                     │
│  └────────────────────────────────────────┘                     │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
```

---

## Decision Tree

```
                    CLAIM SUBMITTED
                         │
                         ▼
              ┌─────────────────────┐
              │ Geolocation provided?│
              └──────┬──────┬───────┘
                    NO      YES
                     │       │
                     ▼       ▼
              Under Review  Check Fraud Score
                           └──────┬──────┬─────┐
                             <0.2  ≥0.2  │     │
                               │    │    └─────┘
                               │    │     Under Review
                               │    │ (High fraud risk)
                               ▼
                        Is trigger type
                      auto-approvable?
                    ┌────┬────┬────┬────┐
                   YES  NO   │    │    │
                    │    │   └────┴────┘
                    │    │   Under Review
                    │    │ (Manual verification
                    │    │  required)
                    ▼
            Call API Validation
            (Heavy Rainfall example)
                    │
                    ▼
        Fetch Weather Data at coordinates
        {rainfall_1h: 65.2}
                    │
                    ▼
        Compare: 65.2 ≥ 50 (threshold)?
              ┌────┴────┐
             YES        NO
              │         │
              ▼         ▼
        AUTO-APPROVED  UNDER REVIEW
        (Instant)      (Manual review)
        Status: ✓      Status: ⚠️
        Payout: YES    Payout: Pending
```

---

## API Response Examples

### ✅ Auto-Approved Response

```json
{
  "message": "Claim submitted. Status: Auto-Approved",
  "claim": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Auto-Approved",
    "triggerType": "Heavy Rainfall",
    "hoursLost": 3,
    "payoutAmount": 500,
    "payoutTransactionId": "TXN1702684800000",
    "isAutoClaim": true,
    "claimDate": "2024-12-16T10:30:00.000Z"
  },
  "autoApprovalDetails": {
    "success": true,
    "disruption_type": "Heavy Rainfall",
    "auto_approved": true,
    "decision_reason": "Threshold met: Actual: 65.2 mm, Threshold: 50 mm",
    "checked_against_api": true,
    "api_used": "OpenWeatherMap (Weather)",
    "validation_data": {
      "approved": true,
      "metric": "rainfall_1h",
      "actual_value": 65.2,
      "threshold": 50,
      "unit": "mm",
      "condition": "Actual: 65.2 mm, Threshold: 50 mm",
      "weather_description": "moderate rain"
    },
    "timestamp": "2024-12-16T10:30:00.000Z"
  }
}
```

### ⚠️ Under Review Response

```json
{
  "message": "Claim submitted. Status: Under Review",
  "claim": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "Under Review",
    "triggerType": "Extreme Heat",
    "hoursLost": 2,
    "payoutAmount": 300,
    "payoutTransactionId": null,
    "isAutoClaim": false,
    "claimDate": "2024-12-16T10:35:00.000Z"
  },
  "autoApprovalDetails": {
    "success": true,
    "disruption_type": "Extreme Heat",
    "auto_approved": false,
    "decision_reason": "Threshold not met: Actual: 42.5°C, Threshold: 45°C",
    "checked_against_api": true,
    "api_used": "OpenWeatherMap (Weather)",
    "validation_data": {
      "approved": false,
      "metric": "temperature",
      "actual_value": 42.5,
      "threshold": 45,
      "unit": "°C",
      "condition": "Actual: 42.5°C, Threshold: 45°C",
      "weather_description": "clear sky"
    },
    "timestamp": "2024-12-16T10:35:00.000Z"
  }
}
```

### ❌ Error Response

```json
{
  "message": "Claim submitted. Status: Under Review",
  "claim": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "Under Review",
    "triggerType": "Heavy Rainfall",
    "hoursLost": 1,
    "payoutAmount": 200,
    "payoutTransactionId": null,
    "claimDate": "2024-12-16T10:40:00.000Z"
  },
  "autoApprovalDetails": {
    "success": false,
    "error": "Weather API failed: timeout",
    "decision_reason": "Could not validate against real-time API data. Moving to manual review.",
    "timestamp": "2024-12-16T10:40:00.000Z"
  }
}
```

---

## Threshold Reference Chart

```
HEAVY RAINFALL
├─ Metric: 1-hour rainfall
├─ Threshold: 50 mm
├─ Example: 65 mm detected → AUTO-APPROVED ✓
│
FLASH FLOOD
├─ Metric: 3-hour rainfall OR flood alert
├─ Threshold: 100 mm OR flood alert active
├─ Example: 120 mm in 3 hours → AUTO-APPROVED ✓
│
EXTREME HEAT
├─ Metric: Temperature
├─ Threshold: 45°C
├─ Example: 48°C detected → AUTO-APPROVED ✓
│
CYCLONE
├─ Metric: Wind speed OR cyclone alert
├─ Threshold: 60 km/h OR alert active
├─ Example: 75 km/h wind detected → AUTO-APPROVED ✓
│
AIR POLLUTION (AQI)
├─ Metric: AQI Level (1-5) OR PM2.5
├─ Threshold: Level ≥ 4 (Poor) OR PM2.5 ≥ 300 µg/m³
├─ Example: Level 5 (Very Poor) → AUTO-APPROVED ✓
└─ Example: PM2.5 = 350 µg/m³ → AUTO-APPROVED ✓
```

---

## User Experience Flow

```
┌─────────────┐
│  User Opens │
│Claims Page  │
└──────┬──────┘
       │
       ▼
┌────────────────┐
│Click "+ New    │
│Claim" Button   │
└──────┬─────────┘
       │
       ▼
┌──────────────────────┐
│System opens form &   │
│requests geolocation  │
│                      │
│"Grant permission?"   │
└──────┬───────┬───────┘
      YES     NO
       │       │
       ▼       ▼
  Capture   Show "Failed
   Coords   to capture"
  "✓ Ready"   │
       │      ▼
       │   Show Retry
       │   Button
       │      │
       └──────┘ (User retries
               if desired)
       │
       ▼
┌──────────────────────┐
│Select Disruption     │
│Type from dropdown    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│(Optional) Enter      │
│"Observed Value"      │
│e.g., "Heavy rain"    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Enter Hours Lost      │
│(1-24)                │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Click "Submit Claim"  │
│Button                │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐         ┌──────────────────┐
│System validates      │         │Server processing │
│with API              │────────→│                  │
│                      │         └──────┬───────────┘
└──────────────────────┘                │
                                        ▼
                                ┌──────────────────┐
                                │Auto-Approved?    │
                                └─────┬──────┬─────┘
                                     YES     NO
                                      │       │
                                      ▼       ▼
                                   ✓ Show  ⚠️ Show
                                   Green  Yellow
                                   Badge  Badge
                                      │       │
                                      ├───────┤
                                      │       │
                                      ▼       ▼
                                   Show Toast
                                   "Approved"/"Review"
                                      │
                                      ▼
                                   Display details
                                   in claim table
                                      │
                                      ▼
                                   ✅ Done!
```

---

## Configuration Matrix

```
┌──────────────────────────────────────────────────────┐
│ Condition      │ Fraud Score │ Result              │
├──────────────────────────────────────────────────────┤
│ API ≥ Thresh   │ < 0.2       │ ✓ AUTO-APPROVED    │
│ API ≥ Thresh   │ ≥ 0.2       │ ⚠️ UNDER REVIEW    │
│ API < Thresh   │ < 0.2       │ ⚠️ UNDER REVIEW    │
│ API < Thresh   │ ≥ 0.2       │ ⚠️ UNDER REVIEW    │
│ No Geolocation │ ANY         │ ⚠️ UNDER REVIEW    │
│ API Error      │ ANY         │ ⚠️ UNDER REVIEW    │
│ Unapprovable   │ ANY         │ ⚠️ UNDER REVIEW    │
│ Type           │             │                    │
└──────────────────────────────────────────────────────┘
```

