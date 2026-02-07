const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    maxProducts: { type: Number, default: 5 },
    maxAlerts: { type: Number, default: 10 },
    scrapeFrequency: { type: String, enum: ['daily', 'hourly', 'realtime'], default: 'daily' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    features: {
      competitorTracking: { type: Boolean, default: false },
      emailAlerts: { type: Boolean, default: true },
      priceHistory: { type: Boolean, default: true },
      exportData: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
