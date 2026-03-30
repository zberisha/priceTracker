const router = require('express').Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPriceHistory,
  scrapeNow,
  exportPriceHistory,
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);
router.get('/:id/prices', getPriceHistory);
router.get('/:id/prices/export', exportPriceHistory);
router.post('/:id/scrape', scrapeNow);

module.exports = router;
