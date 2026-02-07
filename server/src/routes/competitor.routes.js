const router = require('express').Router();
const {
  createCompetitor,
  getCompetitors,
  getCompetitorById,
  updateCompetitor,
  deleteCompetitor,
} = require('../controllers/competitor.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getCompetitors).post(createCompetitor);
router.route('/:id').get(getCompetitorById).put(updateCompetitor).delete(deleteCompetitor);

module.exports = router;
