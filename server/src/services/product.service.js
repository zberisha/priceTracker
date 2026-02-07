const Product = require('../models/Product');
const Price = require('../models/Price');
const AppError = require('../utils/AppError');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

const createProduct = async (userId, data) => {
  const product = await Product.create({ ...data, user: userId });
  return product;
};

const getProducts = async (userId, query = {}) => {
  const { page = 1, limit = 20, search, category } = query;
  const filter = { user: userId, isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  return { products, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getProductById = async (userId, productId) => {
  const redis = getRedis();
  const cacheKey = `product:${productId}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const product = await Product.findOne({ _id: productId, user: userId });
  if (!product) throw new AppError('Product not found', 404);

  if (redis) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
  }

  return product;
};

const updateProduct = async (userId, productId, updates) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, user: userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!product) throw new AppError('Product not found', 404);

  const redis = getRedis();
  if (redis) await redis.del(`product:${productId}`);

  return product;
};

const deleteProduct = async (userId, productId) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, user: userId },
    { isActive: false },
    { new: true }
  );
  if (!product) throw new AppError('Product not found', 404);

  const redis = getRedis();
  if (redis) await redis.del(`product:${productId}`);

  return product;
};

const getPriceHistory = async (productId, query = {}) => {
  const { days = 30, platform } = query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const filter = { product: productId, scrapedAt: { $gte: startDate } };
  if (platform) filter.platform = platform;

  const prices = await Price.find(filter).sort({ scrapedAt: 1 });
  return prices;
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getPriceHistory };
