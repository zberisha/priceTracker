const router = require('express').Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPriceHistory,
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);
router.get('/:id/prices', getPriceHistory);

module.exports = router;
