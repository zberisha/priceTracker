const router = require('express').Router();
const {
  createTracking,
  getTrackings,
  updateTracking,
  deleteTracking,
} = require('../controllers/tracking.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getTrackings).post(createTracking);
router.route('/:id').put(updateTracking).delete(deleteTracking);

module.exports = router;
