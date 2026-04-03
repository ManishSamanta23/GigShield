const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  triggerType: {
    type: String,
    enum: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Cyclone', 'Air Pollution', 'Severe AQI', 'Curfew/Bandh'],
    required: true
  },
  triggerValue: { 
    type: String,
    description: 'User-entered value for reference only - NOT used for auto-approval'
  },
  hoursLost: { type: Number, required: true },
  payoutAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Auto-Approved', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  fraudScore: { type: Number, default: 0 },
  /**
   * Storage for auto-approval validation details
   * Includes API data used, threshold comparison, and decision reasoning
   */
  autoApprovalDetails: {
    success: { type: Boolean, default: false },
    disruption_type: { type: String },
    auto_approved: { type: Boolean },
    decision_reason: { type: String },
    checked_against_api: { type: Boolean, default: false },
    api_used: { type: String },
    error: { type: String },
    // Validation data from API
    validation_data: {
      approved: { type: Boolean },
      metric: { type: String },
      actual_value: { type: mongoose.Schema.Types.Mixed },
      actual_aqi_level: { type: Number }, // For AQI claims
      actual_pm25: { type: Number }, // For AQI claims
      threshold: { type: mongoose.Schema.Types.Mixed },
      unit: { type: String },
      condition: { type: String },
      weather_description: { type: String },
      components: { type: mongoose.Schema.Types.Mixed } // For AQI
    },
    timestamp: { type: Date }
  },
  payoutMethod: { type: String, default: 'UPI' },
  payoutTransactionId: { type: String },
  isAutoClaim: { type: Boolean, default: true },
  claimDate: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Claim', claimSchema);
