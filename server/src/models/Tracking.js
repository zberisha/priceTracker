const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    frequency: { type: String, enum: ['hourly', 'daily', 'weekly'], default: 'daily' },
    lastChecked: { type: Date, default: null },
    nextCheck: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

trackingSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Tracking', trackingSchema);
