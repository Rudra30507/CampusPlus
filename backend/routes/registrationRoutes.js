const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  verifyTicketPass,
} = require('../controllers/registrationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Student passes
router.get('/my-passes', protect, getMyRegistrations);

// Gate Entry Pass Verification (Organizer only)
router.post('/verify-ticket', protect, authorizeRoles('organizer', 'admin'), verifyTicketPass);

// RSVP / Register for an event
router.post('/:eventId', protect, registerForEvent);

// Cancel registration
router.delete('/:registrationId', protect, cancelRegistration);

// Organizer view of attendees
router.get('/event/:eventId/attendees', protect, authorizeRoles('organizer', 'admin'), getEventAttendees);

module.exports = router;
