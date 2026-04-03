# Auto-Approval System Implementation

## Overview

The auto-approval system validates insurance claims against **real-time external API data** (Weather API, AQI API), not user-entered values.

## Key Principles

✅ **Data Source**: Claims are validated using real-time API data from OpenWeatherMap  
✅ **User Input**: The "Observed Value" field is for **reference only** - NOT used for approval decisions  
✅ **Geolocation**: Claim submission must include user's geographic coordinates (latitude/longitude)  
✅ **Automated Decision**: System makes instant approval/rejection based on API thresholds  

---

## System Architecture

### Backend Components

#### 1. **Auto-Approval Engine** (`/backend/utils/autoApprovalEngine.js`)
Core validation logic that:
- Fetches real-time weather and AQI data from OpenWeatherMap
- Compares API values against predefined thresholds
- Returns detailed validation results with reasoning

**Key Functions:**
- `validateClaimAgainstRealData()` - Main entry point for validation
- `validateHeavyRainfall()` - Validates rainfall claims
- `validateFlashFlood()` - Validates flood claims
- `validateExtremeHeat()` - Validates heat claims
- `validateCyclone()` - Validates cyclone/wind claims
- `validateAirPollution()` - Validates AQI claims

#### 2. **Updated Claim Model** (`/backend/models/Claim.js`)
- Added `triggerValue` description: "User-entered value for reference only"
- New field: `autoApprovalDetails` - Stores complete validation results including:
  - API data used
  - Threshold comparisons
  - Decision reasoning
  - Validation timestamp

#### 3. **Updated Routes** (`/backend/routes/claims.js`)
- POST `/api/claims` now:
  - Accepts `latitude` and `longitude` parameters
  - Calls auto-approval engine instead of user value validation
  - Returns auto-approval details in response
  - Logs validation decisions

---

## Thresholds for Auto-Approval

| Disruption Type | Metric | Threshold | API Source |
|-----------------|--------|-----------|-----------|
| **Heavy Rainfall** | 1-hour rainfall | ≥ 50 mm | Weather API |
| **Flash Flood** | 3-hour rainfall OR flood alert | ≥ 100 mm OR alert detected | Weather API |
| **Extreme Heat** | Temperature | ≥ 45°C | Weather API |
| **Cyclone** | Wind speed OR cyclone alert | ≥ 60 km/h OR alert detected | Weather API |
| **Air Pollution** | AQI Level OR PM2.5 | Level ≥ 4 (Poor) OR PM2.5 ≥ 300 µg/m³ | AQI API |

---

## Decision Flow

```
User submits claim with:
├── Disruption Type (required)
├── Observed Value (optional, reference only)
├── Hours Lost (required)
├── Latitude (required for auto-approval)
└── Longitude (required for auto-approval)
         ↓
[System checks]: Fraud score < 0.2?
         ↓
[System calls]: OpenWeatherMap API at coordinates
         ↓
[System compares]: API value vs Threshold
         ↓
├─ API data ≥ Threshold → **AUTO-APPROVED** ✓
│  └─ Payout issued immediately
└─ API data < Threshold → **UNDER REVIEW** ⚠️
   └─ Moves to manual review queue
```

---

## Frontend Integration

### Updated ClaimsPage Component
- **Geolocation Capture**: When claim form opens, system automatically captures user's coordinates
- **Location Status Display**: Shows whether location was successfully captured
- **Reference-Only Field**: "Observed Value" now clearly marked as reference only
- **Validation Message**: Shows which API was used for validation
- **Enhanced Table**: Displays API details instead of just fraud scores

### Geolocation Utils (`/frontend/src/utils/geolocation.jsx`)
- Uses browser Geolocation API
- Requires HTTPS in production
- Gracefully degrades if permission denied

---

## API Configuration

### Required Environment Variables

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### Obtaining API Keys

1. **OpenWeatherMap**
   - Visit: https://openweathermap.org/api
   - Sign up for free account
   - Generate API key
   - Free tier includes: Weather API + AQI data

### Supported APIs

1. **Weather Data** (`/api/weather`)
   - Temperature, humidity, wind speed
   - Precipitation (rainfall, snow)
   - Weather conditions and alerts

2. **AQI Data** (`/api/weather/aqi`)
   - AQI Level (1-5 scale)
   - PM2.5, PM10 concentrations
   - Additional pollutant data

---

## Example Scenarios

### Scenario 1: Heavy Rainfall Claim ✅ AUTO-APPROVED
```
User claims: Heavy Rainfall on 2024-12-15 at [28.6139, 77.2090]
API Response: Rainfall = 65 mm in last 1 hour
Threshold: 50 mm
Decision: 65 mm ≥ 50 mm → AUTO-APPROVED ✓
Payout: ₹500 issued immediately
```

### Scenario 2: Extreme Heat Claim ⚠️ UNDER REVIEW
```
User claims: Extreme Heat on 2024-12-15 at [28.5244, 77.1855]
API Response: Temperature = 42°C
Threshold: 45°C
Decision: 42°C < 45°C → UNDER REVIEW ⚠️
Reason: Threshold not met, manual verification needed
```

### Scenario 3: AQI Pollution Claim ✅ AUTO-APPROVED
```
User claims: Air Pollution on 2024-12-15 at [28.7041, 77.1025]
API Response: AQI Level = 4 (Poor), PM2.5 = 310 µg/m³
Threshold: Level ≥ 4 OR PM2.5 ≥ 300
Decision: Both conditions met → AUTO-APPROVED ✓
Payout: ₹750 issued immediately
```

---

## Important Rules

### Rule 1: User Input Ignored for Approval
❌ **NOT USED**: User-entered "Observed Value" field  
✅ **USED**: Real-time API data only

### Rule 2: Geolocation Required
- Latitude/Longitude must be provided
- System will NOT auto-approve without coordinates
- Claims move to manual review if location unavailable

### Rule 3: Fraud Risk Check
- Even if API threshold is met, claim rejected if fraud score ≥ 0.2
- Fraud score calculation based on suspicious patterns
- High-risk hours (12+ hours claimed) increase fraud score

### Rule 4: Coverage Validation
- Disruption type must be covered under worker's policy
- Auto-approval only for eligible claim types
- Other types moved to manual review

---

## Testing the System

### Test Case 1: Successful Auto-Approval
```bash
# During heavy rainfall
curl -X POST http://localhost:5000/api/claims \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "Heavy Rainfall",
    "triggerValue": "Observed: Heavy rain",
    "hoursLost": 3,
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

### Expected Response (Auto-Approved)
```json
{
  "message": "Claim submitted. Status: Auto-Approved",
  "claim": {
    "status": "Auto-Approved",
    "payoutTransactionId": "TXN1702684800000"
  },
  "autoApprovalDetails": {
    "success": true,
    "auto_approved": true,
    "decision_reason": "Threshold met: Actual: 65.2 mm, Threshold: 50 mm",
    "api_used": "OpenWeatherMap (Weather)",
    "validation_data": {
      "actual_value": 65.2,
      "threshold": 50,
      "unit": "mm"
    }
  }
}
```

---

## Troubleshooting

### Issue: API Key Not Configured
```
Error: OPENWEATHER_API_KEY is not configured in .env
```
**Solution**: Add API key to `.env` file and restart server

### Issue: Geolocation Permission Denied
```
Error: Could not capture location. Manual review will be required.
```
**Solution**: 
- User must grant location permission in browser
- System will still process claim but mark as "Under Review"

### Issue: API Timeout
```
Error: Weather API failed: timeout
```
**Solution**: 
- Check internet connectivity
- Verify API key is valid
- Claim will move to manual review

---

## Database Schema

### Claim Collection - New Fields

```javascript
{
  // ... existing fields ...
  triggerValue: String, // Reference only
  autoApprovalDetails: {
    success: Boolean,
    disruption_type: String,
    auto_approved: Boolean,
    decision_reason: String,
    checked_against_api: Boolean,
    api_used: String,
    error: String,
    validation_data: {
      approved: Boolean,
      metric: String,
      actual_value: Number,
      threshold: Number,
      unit: String,
      condition: String,
      weather_description: String
    },
    timestamp: Date
  }
}
```

---

## Future Enhancements

1. **Multi-Source API Integration**: Add more disaster/flood alert APIs
2. **Historical Data Analysis**: Track past claims vs API data
3. **Machine Learning**: Improve fraud detection
4. **SMS/Push Notifications**: Real-time claim status updates
5. **Admin Dashboard**: Review auto-approval decisions
6. **Geofencing**: Automatic claims based on location + weather API

---

## Support & Documentation

- **API Docs**: OpenWeatherMap → https://openweathermap.org/api
- **Implementation Guide**: See this file
- **Code Comments**: Auto-Approval Engine has detailed comments
- **Error Logs**: Check server logs for API failures

