const mongoose = require('mongoose');

/**
 * Policy Schema:
 * Defines the active insurance contract between a worker and the Avaran platform.
 * Tracks coverage limits, personalized premiums, and financial balances.
 */
const policySchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  plan: { type: String, enum: ['Basic', 'Pro', 'Max'], required: true },
  weeklyPremium: { type: Number, required: true },
  maxWeeklyPayout: { type: Number, required: true },
  coverageEvents: [String],
  status: { type: String, enum: ['Active', 'Paused', 'Expired'], default: 'Active' },
  startDate: { type: Date, default: Date.now },
  nextBillingDate: { type: Date },
  totalPremiumPaid: { type: Number, default: 0 },
  totalPayoutReceived: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

/**
 * Lifecycle Hook:
 * Automatically calculates the next billing cycle start (following Monday)
 * upon policy creation.
 */
policySchema.pre('save', function (next) {
  if (!this.nextBillingDate) {
    const now = new Date();
    const day = now.getDay();
    const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
    this.nextBillingDate = new Date(now.setDate(now.getDate() + daysUntilMonday));
  }
  next();
});

module.exports = mongoose.model('Policy', policySchema);
