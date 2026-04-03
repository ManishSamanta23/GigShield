# Auto-Approval Engine: Developer Reference

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLAIM SUBMISSION                        │
│  (ClaimsPage.jsx sends: triggerType, latitude, longitude)  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLAIMS ROUTE (/api/claims)               │
│  1. Validate input schema                                  │
│  2. Check active policy exists                             │
│  3. Calculate fraud score                                  │
│  4. Call autoApprovalEngine if geolocation provided        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           AUTO-APPROVAL ENGINE (autoApprovalEngine.js)     │
│                                                             │
│  validateClaimAgainstRealData(type, lat, lon)             │
│      ↓                                                      │
│   Normalize disruption type                               │
│      ↓                                                      │
│   Route to specific validator:                            │
│   ├── validateHeavyRainfall()                             │
│   ├── validateFlashFlood()                                │
│   ├── validateExtremeHeat()                               │
│   ├── validateCyclone()                                   │
│   └── validateAirPollution()                              │
│      ↓                                                      │
│   Each validator:                                         │
│   ├── Calls fetchWeatherData() or fetchAQIData()         │
│   ├── Extracts relevant metric from API response         │
│   ├── Compares against threshold                         │
│   └── Returns validation result                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              OpenWeatherMap API (External)                 │
│                                                             │
│  Weather API: /weather?lat={lat}&lon={lon}                │
│  Response: temp, rainfall, wind_speed, conditions         │
│                                                             │
│  AQI API: /air_pollution?lat={lat}&lon={lon}             │
│  Response: aqi_level, pm25, pm10, etc.                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DECISION & RESPONSE                           │
│                                                             │
│  If API value ≥ Threshold:                               │
│  └─ status = "Auto-Approved"                             │
│     payoutTransactionId = generated                      │
│     autoApprovalDetails = validation results             │
│                                                             │
│  Else:                                                     │
│  └─ status = "Under Review"                              │
│     autoApprovalDetails = why not approved               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         CLAIM SAVED TO DATABASE                            │
│                                                             │
│  Stored with:                                             │
│  - Complete autoApprovalDetails                          │
│  - API data used                                         │
│  - Validation timestamp                                  │
│  - Full audit trail                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Function Reference

### Main Entry Point

```javascript
// In /backend/routes/claims.js, POST route:
const validationResult = await validateClaimAgainstRealData(
  triggerType,    // String: 'Heavy Rainfall', 'Flash Flood', etc.
  latitude,       // Number: e.g., 28.6139
  longitude       // Number: e.g., 77.2090
);

// Returns:
{
  success: true,
  disruption_type: 'Heavy Rainfall',
  auto_approved: true,
  decision_reason: 'Threshold met: Actual: 65.2 mm, Threshold: 50 mm',
  validation_data: {
    approved: true,
    metric: 'rainfall_1h',
    actual_value: 65.2,
    threshold: 50,
    unit: 'mm',
    condition: 'Actual: 65.2 mm, Threshold: 50 mm',
    weather_description: 'heavy rain'
  },
  checked_against_api: true,
  api_used: 'OpenWeatherMap (Weather)',
  timestamp: Date
}
```

### API Fetch Functions

```javascript
// Fetch real-time weather data
const weatherData = await fetchWeatherData(28.6139, 77.2090);
// Returns: temp, rainfall_1h, rainfall_3h, wind_speed, weather_condition

// Fetch real-time AQI data
const aqiData = await fetchAQIData(28.6139, 77.2090);
// Returns: aqi_level, pm25, pm10, no2, o3, co, so2
```

### Type-Specific Validators

```javascript
// Each returns validation result with:
// - approved: Boolean
// - actual_value: Number
// - threshold: Number
// - unit: String
// - condition: String (human-readable)

await validateHeavyRainfall(lat, lon);
await validateFlashFlood(lat, lon);
await validateExtremeHeat(lat, lon);
await validateCyclone(lat, lon);
await validateAirPollution(lat, lon);
```

---

## Error Handling

### Graceful Degradation

If API calls fail:
```javascript
{
  success: false,
  auto_approved: false,
  error: 'Weather API failed: timeout',
  decision_reason: 'Could not validate against real-time API data. Moving to manual review.',
  timestamp: Date
}
```

**Result**: Claim moved to "Under Review" instead of failing

---

## Modifying Thresholds

### Location: `/backend/utils/autoApprovalEngine.js` (lines 13-32)

```javascript
const AUTO_APPROVAL_THRESHOLDS = {
  'Heavy Rainfall': {
    metric: 'rainfall_mm',
    threshold: 50,  // ← Change this value
    description: 'Rainfall >= 50 mm'
  },
  // ...
};
```

**Important**: Update validator functions to match new thresholds

### Example: Changing Heavy Rainfall Threshold to 45mm

```javascript
// Step 1: Update threshold
'Heavy Rainfall': {
  threshold: 45,  // Changed from 50
  description: 'Rainfall >= 45 mm'
},

// Step 2: No code changes needed in validator
// It reads from the constant automatically
```

---

## Adding a New Disruption Type

### Step 1: Add to Claim Model
```javascript
// /backend/models/Claim.js
triggerType: {
  enum: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Cyclone', 
         'Air Pollution', 'Custom Type'],
}
```

### Step 2: Add Threshold
```javascript
// /backend/utils/autoApprovalEngine.js
const AUTO_APPROVAL_THRESHOLDS = {
  // ... existing types ...
  'Custom Type': {
    metric: 'custom_metric',
    threshold: 100,
    description: 'Custom threshold description'
  }
};
```

### Step 3: Create Validator Function
```javascript
async function validateCustomType(latitude, longitude) {
  const apiData = await fetchWeatherData(latitude, longitude);
  // Extract relevant metric
  const value = apiData.your_metric;
  const threshold = AUTO_APPROVAL_THRESHOLDS['Custom Type'].threshold;
  
  return {
    approved: value >= threshold,
    metric: 'custom_metric',
    actual_value: value,
    threshold: threshold,
    unit: 'units',
    condition: `Actual: ${value}, Threshold: ${threshold}`
  };
}
```

### Step 4: Add Case to Main Validator
```javascript
async function validateClaimAgainstRealData(disruptionType, latitude, longitude) {
  switch (normalizedType) {
    // ... existing cases ...
    case 'Custom Type':
      validationResult = await validateCustomType(latitude, longitude);
      break;
  }
}
```

### Step 5: Update Frontend
```javascript
// /frontend/src/pages/ClaimsPage.jsx
const TRIGGERS = ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 
                  'Cyclone', 'Air Pollution', 'Custom Type'];
```

---

## Testing & Validation

### Unit Test Template
```javascript
// Test auto-approval logic
const result = await validateClaimAgainstRealData(
  'Heavy Rainfall',
  28.6139, // Delhi coordinates
  77.2090
);

console.log('Success:', result.success);
console.log('Approved:', result.auto_approved);
console.log('Reason:', result.decision_reason);
```

### Integration Test
```bash
# Submit claim via API
curl -X POST http://localhost:5000/api/claims \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "Heavy Rainfall",
    "triggerValue": "Heavy rain observed",
    "hoursLost": 3,
    "latitude": 28.6139,
    "longitude": 77.2090
  }'

# Check response status and autoApprovalDetails
```

---

## Performance Considerations

### API Call Overhead
- **Weather API**: ~200-300ms
- **AQI API**: ~200-300ms
- **Total per claim**: 400-600ms (cached by OpenWeatherMap)

### Optimization Tips
1. **Implement caching**: Cache API responses for 30 minutes
2. **Batch processing**: Group claims by location
3. **Queue system**: Use Bull/RabbitMQ for high volume
4. **Rate limiting**: Monitor OpenWeatherMap API usage

### Current Timeouts
```javascript
// In autoApprovalEngine.js
axios.get(url, {
  timeout: 5000  // 5 seconds - adjust if needed
})
```

---

## Common Issues & Solutions

### Issue: Claims not auto-approving
**Check**:
1. Is geolocation provided? `latitude && longitude`
2. Is API key configured? `OPENWEATHER_API_KEY`
3. Is fraud score < 0.2? Check `fraudScore` in logs
4. Is trigger type in `AUTO_APPROVABLE_TRIGGERS`?

### Issue: API timeouts
**Solutions**:
1. Increase timeout to 8000ms
2. Check API rate limits
3. Verify internet connectivity
4. Check OpenWeatherMap status page

### Issue: Coordinates not captured
**Solutions**:
1. User must grant geolocation permission
2. Must use HTTPS (except localhost)
3. Browser must support Geolocation API

---

## Logging & Debugging

### Key Log Points
```javascript
// In /backend/routes/claims.js POST route:
console.log(`🔍 Validating claim (${triggerType}) against real API data`);
console.log(`✅ Claim AUTO-APPROVED based on API validation`);
console.log(`⚠️ Claim UNDER REVIEW`);
console.error('❌ API validation failed');
```

### Enable Detailed Logs
```javascript
// Add to /backend/utils/autoApprovalEngine.js
console.log('Weather API Response:', weather); // Check raw data
console.log('Validation Result:', validationResult); // Check comparison
```

---

## Security Considerations

### Protected Routes
- `POST /api/claims` - Auth required via `protect` middleware
- `GET /api/claims/my` - Auth required

### API Key Security
- Store OPENWEATHER_API_KEY in .env only
- Never commit .env to git
- Rotate keys periodically

### Data Privacy
- Latitude/Longitude are not stored (calculated from browser)
- Only validation result is stored in database
- No personal location data in logs

