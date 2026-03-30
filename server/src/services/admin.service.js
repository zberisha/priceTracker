const User = require('../models/User');
const Product = require('../models/Product');
const Price = require('../models/Price');
const Alert = require('../models/Alert');
const Tracking = require('../models/Tracking');
const Subscription = require('../models/Subscription');
const axios = require('axios');

const getKpis = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    newUsersWeek,
    totalProducts,
    activeProducts,
    totalPricePoints,
    pricePointsToday,
    alertsTriggeredToday,
    activeTrackings,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Price.countDocuments(),
    Price.countDocuments({ createdAt: { $gte: today } }),
    Alert.countDocuments({ isTriggered: true, triggeredAt: { $gte: today } }),
    Tracking.countDocuments({ isActive: true }),
  ]);

  return {
    totalUsers,
    newUsersWeek,
    totalProducts,
    activeProducts,
    totalPricePoints,
    pricePointsToday,
    alertsTriggeredToday,
    activeTrackings,
  };
};

const getUsers = async (query = {}) => {
  const { page = 1, limit = 20, search, plan } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const userIds = users.map((u) => u._id);

  const [subscriptions, productCounts] = await Promise.all([
    Subscription.find({ user: { $in: userIds }, isActive: true }).lean(),
    Product.aggregate([
      { $match: { user: { $in: userIds }, isActive: true } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  const subMap = {};
  subscriptions.forEach((s) => { subMap[s.user.toString()] = s; });
  const countMap = {};
  productCounts.forEach((p) => { countMap[p._id.toString()] = p.count; });

  let enriched = users.map((u) => ({
    ...u,
    subscription: subMap[u._id.toString()] || { plan: 'free' },
    productCount: countMap[u._id.toString()] || 0,
  }));

  if (plan) {
    enriched = enriched.filter((u) => u.subscription.plan === plan);
  }

  const total = search
    ? await User.countDocuments(filter)
    : await User.countDocuments();

  return { users: enriched, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

const changeUserPlan = async (userId, plan) => {
  const { updateSubscription } = require('./subscription.service');
  return updateSubscription(userId, plan);
};

const getSubscriptionBreakdown = async () => {
  const breakdown = await Subscription.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$plan', count: { $sum: 1 } } },
  ]);

  const totalUsers = await User.countDocuments({ isActive: true });
  const subscribedUsers = breakdown.reduce((sum, b) => sum + b.count, 0);
  const implicitFree = totalUsers - subscribedUsers;

  const result = { free: 0, basic: 0, premium: 0 };
  breakdown.forEach((b) => { result[b._id] = b.count; });
  result.free += implicitFree;

  return result;
};

const getScraperStatus = async () => {
  const scraperUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8000';
  let healthy = false;
  let scraperInfo = null;

  try {
    const { data } = await axios.get(`${scraperUrl}/health`, { timeout: 5000 });
    healthy = data.status === 'ok';
    scraperInfo = data;
  } catch {
    healthy = false;
  }

  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [pricesToday, pricesWeek, staleProducts, recentPricesByHour] = await Promise.all([
    Price.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    Price.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Product.countDocuments({
      isActive: true,
      updatedAt: { $lt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
    }),
    Price.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const match = recentPricesByHour.find((h) => h._id === i);
    return { hour: `${String(i).padStart(2, '0')}:00`, count: match?.count || 0 };
  });

  return {
    healthy,
    scraperInfo,
    pricesToday,
    pricesWeek,
    staleProducts,
    scrapeInterval: process.env.SCRAPE_INTERVAL_MINUTES || 60,
    hourlyData,
  };
};

module.exports = { getKpis, getUsers, toggleUserStatus, changeUserPlan, getSubscriptionBreakdown, getScraperStatus };
