const Subscription = require('../models/Subscription');
const AppError = require('../utils/AppError');

const PLANS = {
  free: { maxProducts: 5, maxAlerts: 10, scrapeFrequency: 'daily', features: { competitorTracking: false, emailAlerts: true, priceHistory: true, exportData: false } },
  basic: { maxProducts: 25, maxAlerts: 50, scrapeFrequency: 'hourly', features: { competitorTracking: true, emailAlerts: true, priceHistory: true, exportData: false } },
  premium: { maxProducts: 100, maxAlerts: 200, scrapeFrequency: 'realtime', features: { competitorTracking: true, emailAlerts: true, priceHistory: true, exportData: true } },
};

const getSubscription = async (userId) => {
  let sub = await Subscription.findOne({ user: userId, isActive: true });
  if (!sub) {
    sub = await Subscription.create({ user: userId, plan: 'free', ...PLANS.free });
  }
  return sub;
};

const updateSubscription = async (userId, plan) => {
  if (!PLANS[plan]) throw new AppError('Invalid plan', 400);

  const sub = await Subscription.findOneAndUpdate(
    { user: userId, isActive: true },
    { plan, ...PLANS[plan], startDate: new Date() },
    { new: true, upsert: true }
  );
  return sub;
};

const getPlans = () => {
  return Object.entries(PLANS).map(([name, config]) => ({ name, ...config }));
};

module.exports = { getSubscription, updateSubscription, getPlans, PLANS };
