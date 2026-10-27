const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventStats,
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats/summary', getEventStats);
router.route('/')
  .get(getEvents)
  .post(protect, authorizeRoles('organizer', 'admin'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorizeRoles('organizer', 'admin'), updateEvent)
  .delete(protect, authorizeRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
