const router = require('express').Router();
const {
  createAlert,
  getAlerts,
  markAsRead,
  markAllAsRead,
  deleteAlert,
} = require('../controllers/alert.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getAlerts).post(createAlert);
router.put('/read-all', markAllAsRead);
router.route('/:id').delete(deleteAlert);
router.put('/:id/read', markAsRead);

module.exports = router;
