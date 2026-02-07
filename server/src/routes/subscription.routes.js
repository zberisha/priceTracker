const router = require('express').Router();
const { getSubscription, updateSubscription, getPlans } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/plans', getPlans);

router.use(protect);

router.route('/').get(getSubscription).put(updateSubscription);

module.exports = router;
