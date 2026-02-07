const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['price_drop', 'price_target', 'back_in_stock', 'competitor_change'],
      required: true,
    },
    targetPrice: { type: Number, default: null },
    percentageThreshold: { type: Number, default: null },
    isTriggered: { type: Boolean, default: false },
    triggeredAt: { type: Date, default: null },
    message: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
