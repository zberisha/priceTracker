const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getKpis,
  getUsers,
  toggleUserStatus,
  changeUserPlan,
  getSubscriptionBreakdown,
  getScraperStatus,
} = require('../controllers/admin.controller');

router.use(protect);
router.use(authorize('admin'));

router.get('/kpis', getKpis);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/plan', changeUserPlan);
router.get('/subscriptions/breakdown', getSubscriptionBreakdown);
router.get('/scraper/status', getScraperStatus);

module.exports = router;
