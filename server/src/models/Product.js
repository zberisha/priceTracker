const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General', trim: true },
    brand: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    sourceUrls: [
      {
        platform: { type: String, enum: ['amazon', 'walmart', 'ebay', 'other'], required: true },
        url: { type: String, required: true },
      },
    ],
    currentPrice: { type: Number, default: 0 },
    lowestPrice: { type: Number, default: 0 },
    highestPrice: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
