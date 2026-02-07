const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const Price = require('../models/Price');

router.use(protect);

// Get prices for a product with optional platform filter
router.get('/', async (req, res, next) => {
  try {
    const { product, platform, limit = 100 } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (platform) filter.platform = platform;

    const prices = await Price.find(filter)
      .sort({ scrapedAt: -1 })
      .limit(Number(limit))
      .populate('product', 'name')
      .populate('competitor', 'name platform');

    res.json(prices);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
