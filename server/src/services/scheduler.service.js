const cron = require('node-cron');
const Product = require('../models/Product');
const Price = require('../models/Price');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Tracking = require('../models/Tracking');
const { scrapePriceFromUrl } = require('./scraper.service');
const { sendPriceDropAlert } = require('./notification.service');
const logger = require('../utils/logger');

const processProduct = async (product) => {
  for (const source of product.sourceUrls) {
    const result = await scrapePriceFromUrl(source.url, source.platform);
    if (!result || result.price === null) continue;

    // Save price record
    await Price.create({
      product: product._id,
      platform: source.platform,
      price: result.price,
      url: source.url,
    });

    const oldPrice = product.currentPrice;

    // Update product prices
    const updates = { currentPrice: result.price };
    if (result.price < product.lowestPrice || product.lowestPrice === 0) {
      updates.lowestPrice = result.price;
    }
    if (result.price > product.highestPrice) {
      updates.highestPrice = result.price;
    }

    await Product.findByIdAndUpdate(product._id, updates);

    // Check price-drop alerts
    if (oldPrice > 0 && result.price < oldPrice) {
      const alerts = await Alert.find({
        product: product._id,
        isActive: true,
        isTriggered: false,
        type: { $in: ['price_drop', 'price_target'] },
      });

      for (const alert of alerts) {
        let shouldTrigger = false;

        if (alert.type === 'price_drop' && alert.percentageThreshold) {
          const drop = ((oldPrice - result.price) / oldPrice) * 100;
          if (drop >= alert.percentageThreshold) shouldTrigger = true;
        }

        if (alert.type === 'price_target' && alert.targetPrice) {
          if (result.price <= alert.targetPrice) shouldTrigger = true;
        }

        if (shouldTrigger) {
          await Alert.findByIdAndUpdate(alert._id, {
            isTriggered: true,
            triggeredAt: new Date(),
            message: `Price dropped from $${oldPrice.toFixed(2)} to $${result.price.toFixed(2)}`,
          });

          // Send email notification
          const user = await User.findById(alert.user);
          if (user && user.notificationPreferences?.email) {
            await sendPriceDropAlert(user, product, oldPrice, result.price);
          }
        }
      }
    }
  }
};

const runPriceScraping = async () => {
  logger.info('Starting scheduled price scraping...');

  try {
    const activeTrackings = await Tracking.find({ isActive: true }).populate('product');
    const productIds = [...new Set(activeTrackings.map((t) => t.product?._id?.toString()).filter(Boolean))];

    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    logger.info(`Scraping prices for ${products.length} products`);

    for (const product of products) {
      try {
        await processProduct(product);
      } catch (err) {
        logger.error(`Error processing product ${product._id}: ${err.message}`);
      }
    }

    // Update tracking records
    await Tracking.updateMany(
      { isActive: true },
      { lastChecked: new Date(), nextCheck: getNextCheckDate() }
    );

    logger.info('Price scraping completed.');
  } catch (error) {
    logger.error(`Scheduler error: ${error.message}`);
  }
};

const getNextCheckDate = () => {
  const next = new Date();
  next.setMinutes(next.getMinutes() + Number(process.env.SCRAPE_INTERVAL_MINUTES || 60));
  return next;
};

const startScheduler = () => {
  const intervalMinutes = process.env.SCRAPE_INTERVAL_MINUTES || 60;
  const cronExpression = `*/${intervalMinutes} * * * *`;

  cron.schedule(cronExpression, () => {
    runPriceScraping();
  });

  logger.info(`Scheduler started: running every ${intervalMinutes} minutes`);
};

module.exports = { startScheduler, runPriceScraping };
