const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    competitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitor', default: null },
    platform: { type: String, enum: ['amazon', 'walmart', 'ebay', 'other'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    url: { type: String, default: '' },
    scrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

priceSchema.index({ product: 1, scrapedAt: -1 });
priceSchema.index({ product: 1, platform: 1, scrapedAt: -1 });

module.exports = mongoose.model('Price', priceSchema);
