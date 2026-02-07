const Tracking = require('../models/Tracking');
const AppError = require('../utils/AppError');

const createTracking = async (userId, data) => {
  const existing = await Tracking.findOne({ user: userId, product: data.product });
  if (existing) {
    throw new AppError('Already tracking this product', 400);
  }

  const tracking = await Tracking.create({ ...data, user: userId });
  return tracking;
};

const getTrackings = async (userId) => {
  return Tracking.find({ user: userId, isActive: true })
    .populate('product', 'name currentPrice lowestPrice highestPrice imageUrl')
    .sort({ createdAt: -1 });
};

const updateTracking = async (userId, trackingId, updates) => {
  const tracking = await Tracking.findOneAndUpdate(
    { _id: trackingId, user: userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!tracking) throw new AppError('Tracking entry not found', 404);
  return tracking;
};

const deleteTracking = async (userId, trackingId) => {
  const tracking = await Tracking.findOneAndUpdate(
    { _id: trackingId, user: userId },
    { isActive: false },
    { new: true }
  );
  if (!tracking) throw new AppError('Tracking entry not found', 404);
  return tracking;
};

module.exports = { createTracking, getTrackings, updateTracking, deleteTracking };
