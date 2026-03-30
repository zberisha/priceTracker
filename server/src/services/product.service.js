const Product = require('../models/Product');
const Price = require('../models/Price');
const AppError = require('../utils/AppError');
const { getRedis } = require('../config/redis');
const { getSubscription } = require('./subscription.service');

const CACHE_TTL = 300; // 5 minutes

const createProduct = async (userId, data) => {
  const sub = await getSubscription(userId);
  const count = await Product.countDocuments({ user: userId, isActive: true });
  if (count >= sub.maxProducts) {
    throw new AppError(`Product limit reached (${sub.maxProducts}). Upgrade your plan to add more.`, 403);
  }
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

const scrapeNow = async (userId, productId) => {
  const product = await Product.findOne({ _id: productId, user: userId, isActive: true });
  if (!product) throw new AppError('Product not found', 404);
  if (!product.sourceUrls || product.sourceUrls.length === 0) {
    throw new AppError('No source URLs to scrape', 400);
  }

  const { scrapePriceFromUrl } = require('./scraper.service');
  const results = [];

  for (const source of product.sourceUrls) {
    const result = await scrapePriceFromUrl(source.url, source.platform);
    if (!result || result.price === null) continue;

    await Price.create({
      product: product._id,
      platform: source.platform,
      price: result.price,
      currency: result.currency || 'USD',
      url: source.url,
    });

    const updates = { currentPrice: result.price, currency: result.currency || 'USD' };
    if (result.price < product.lowestPrice || product.lowestPrice === 0) {
      updates.lowestPrice = result.price;
    }
    if (result.price > product.highestPrice) {
      updates.highestPrice = result.price;
    }

    await Product.findByIdAndUpdate(product._id, updates);

    const redis = getRedis();
    if (redis) await redis.del(`product:${productId}`);

    results.push({ platform: source.platform, price: result.price, title: result.title });
  }

  if (results.length === 0) {
    throw new AppError('Scraping returned no results — the scraper service may be down or selectors need updating.', 502);
  }

  const updated = await Product.findById(productId);
  return { product: updated, scraped: results };
};

const exportPriceHistoryCsv = async (userId, productId, query = {}) => {
  const sub = await getSubscription(userId);
  if (!sub.features.exportData) {
    throw new AppError('Data export is not available on your plan. Upgrade to premium to access this feature.', 403);
  }

  const product = await Product.findOne({ _id: productId, user: userId });
  if (!product) throw new AppError('Product not found', 404);

  const { days = 365, platform } = query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const filter = { product: productId, scrapedAt: { $gte: startDate } };
  if (platform) filter.platform = platform;

  const prices = await Price.find(filter).sort({ scrapedAt: 1 });

  const header = 'Date,Platform,Price,Currency,URL';
  const rows = prices.map((p) => {
    const date = new Date(p.scrapedAt).toISOString();
    const url = (p.url || '').replace(/"/g, '""');
    return `${date},${p.platform},${p.price},${p.currency || 'USD'},"${url}"`;
  });

  return {
    filename: `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_price_history.csv`,
    csv: [header, ...rows].join('\n'),
  };
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getPriceHistory, scrapeNow, exportPriceHistoryCsv };
