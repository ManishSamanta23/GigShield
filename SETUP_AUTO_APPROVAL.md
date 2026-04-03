# Setup Guide: Auto-Approval System

## Quick Start

### 1. Get OpenWeatherMap API Key

1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key

### 2. Configure Backend

Add to `.env` file in `/backend/`:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Restart Server

```bash
npm restart
# or
npm start
```

---

## Testing the Auto-Approval System

### Step 1: Enable Developer Tools

Open browser console (F12) and check Network tab

### Step 2: Submit a Test Claim

1. Navigate to Claims page
2. Click "+ New Claim"
3. System will prompt for location access
4. Grant permission
5. Select disruption type (e.g., "Heavy Rainfall")
6. Set hours lost
7. Click "Submit Claim"

### Step 3: Check Results

**If auto-approved:**
- ✅ Status shows "Auto-Approved"
- ✅ Green badge displays
- ✅ Transaction ID generated
- ✅ Payout calculated

**If under review:**
- ⚠️ Status shows "Under Review"
- ⚠️ Check logs for why approval was denied
- ✅ Still eligible for manual review

### Step 4: Check Server Logs

Server logs will show:
```
🔍 Validating claim (Heavy Rainfall) against real API data at [28.6139, 77.2090]
✅ Claim AUTO-APPROVED based on API validation: Threshold met: Actual: 65.2 mm, Threshold: 50 mm
```

---

## Environment Requirements

### Frontend
- ✅ Geolocation API (HTTPS required in production)
- ✅ React with hooks
- ✅ React Hot Toast for notifications

### Backend
- ✅ Node.js with Express
- ✅ MongoDB for data storage
- ✅ Axios for HTTP requests
- ✅ Zod for schema validation

### APIs
- ✅ OpenWeatherMap (free tier sufficient)
- ✅ Internet connection for API calls

---

## Production Checklist

- [ ] OpenWeatherMap API key configured
- [ ] HTTPS enabled (required for geolocation)
- [ ] Environment variables set in production
- [ ] API timeout configured appropriately
- [ ] Error handling tested
- [ ] Database backup configured
- [ ] Logs monitored for API failures
- [ ] Location permissions prompt customized

---

## Common Configuration Issues

### Issue: "OPENWEATHER_API_KEY not configured"
**Fix**: Add to `.env` and restart server

### Issue: "Invalid API key"
**Fix**: Verify key is correct at openweathermap.org/api

### Issue: Geolocation not working
**Fix**: 
- Must use HTTPS in production
- User must grant permission
- Browser must support Geolocation API

### Issue: Timeouts on API calls
**Fix**: Increase timeout in autoApprovalEngine.js (currently 5000ms)

---

## Monitoring & Logs

### Key Metrics to Monitor

1. **Auto-Approval Rate**
   - Track % of claims auto-approved
   - Should be 60-80% in normal conditions

2. **API Availability**
   - Monitor OpenWeatherMap API uptime
   - Set alerts for failures

3. **Geolocation Success Rate**
   - Track % of users granting permission
   - Should be >90%

4. **Fraud Detection**
   - Monitor fraud_score distribution
   - Identify patterns

---

## Support Contacts

- **OpenWeatherMap Support**: https://openweathermap.org/faq
- **Project Logs**: Check `/backend/index.js` console output
- **Error Reporting**: Check server error logs

---

## API Rate Limits

**OpenWeatherMap Free Tier:**
- ✅ 1,000 calls/day
- ✅ Calls per minute: 60
- ✅ Sufficient for small-to-medium deployments

**For higher volumes:**
- Upgrade to paid plan
- Implement caching layer
- Add queue system (Bull/RabbitMQ)

