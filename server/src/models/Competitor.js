const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['amazon', 'walmart', 'ebay', 'other'], required: true },
    baseUrl: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentPrice: { type: Number, default: 0 },
    lastChecked: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    sellerRating: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Competitor', competitorSchema);
