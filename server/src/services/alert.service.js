const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');

const createAlert = async (userId, data) => {
  const alert = await Alert.create({ ...data, user: userId });
  return alert;
};

const getAlerts = async (userId, query = {}) => {
  const { isRead, type, page = 1, limit = 20 } = query;
  const filter = { user: userId, isActive: true };

  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (type) filter.type = type;

  const alerts = await Alert.find(filter)
    .populate('product', 'name currentPrice imageUrl')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Alert.countDocuments(filter);
  return { alerts, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const markAsRead = async (userId, alertId) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: alertId, user: userId },
    { isRead: true },
    { new: true }
  );
  if (!alert) throw new AppError('Alert not found', 404);
  return alert;
};

const markAllAsRead = async (userId) => {
  await Alert.updateMany({ user: userId, isRead: false }, { isRead: true });
};

const deleteAlert = async (userId, alertId) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: alertId, user: userId },
    { isActive: false },
    { new: true }
  );
  if (!alert) throw new AppError('Alert not found', 404);
  return alert;
};

module.exports = { createAlert, getAlerts, markAsRead, markAllAsRead, deleteAlert };
