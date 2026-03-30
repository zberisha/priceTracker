const Competitor = require('../models/Competitor');
const AppError = require('../utils/AppError');
const { getSubscription } = require('./subscription.service');

const createCompetitor = async (userId, data) => {
  const sub = await getSubscription(userId);
  if (!sub.features.competitorTracking) {
    throw new AppError('Competitor tracking is not available on your plan. Upgrade to access this feature.', 403);
  }
  const competitor = await Competitor.create({ ...data, user: userId });
  return competitor;
};

const getCompetitors = async (userId, productId) => {
  const sub = await getSubscription(userId);
  if (!sub.features.competitorTracking) {
    throw new AppError('Competitor tracking is not available on your plan. Upgrade to access this feature.', 403);
  }
  const filter = { user: userId, isActive: true };
  if (productId) filter.product = productId;

  return Competitor.find(filter).populate('product', 'name currentPrice');
};

const getCompetitorById = async (userId, competitorId) => {
  const competitor = await Competitor.findOne({ _id: competitorId, user: userId }).populate('product');
  if (!competitor) throw new AppError('Competitor not found', 404);
  return competitor;
};

const updateCompetitor = async (userId, competitorId, updates) => {
  const competitor = await Competitor.findOneAndUpdate(
    { _id: competitorId, user: userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!competitor) throw new AppError('Competitor not found', 404);
  return competitor;
};

const deleteCompetitor = async (userId, competitorId) => {
  const competitor = await Competitor.findOneAndUpdate(
    { _id: competitorId, user: userId },
    { isActive: false },
    { new: true }
  );
  if (!competitor) throw new AppError('Competitor not found', 404);
  return competitor;
};

module.exports = { createCompetitor, getCompetitors, getCompetitorById, updateCompetitor, deleteCompetitor };
