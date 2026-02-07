const User = require('../models/User');
const Subscription = require('../models/Subscription');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({ name, email, password });

  // Create default free subscription
  await Subscription.create({ user: user._id, plan: 'free' });

  const token = generateToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user._id);
  return { user: user.toJSON(), token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const updateProfile = async (userId, updates) => {
  const allowed = ['name', 'notificationPreferences'];
  const filteredUpdates = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

module.exports = { register, login, getProfile, updateProfile };
