const express = require('express');
const router = express.Router();
const {
  getEventTeams,
  createTeamRequest,
  joinTeam,
  approveJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
  leaveTeam,
  deleteTeamRequest,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.get('/event/:eventId', getEventTeams);
router.post('/event/:eventId', protect, createTeamRequest);

// Squad interaction routes
router.post('/:teamId/join', protect, joinTeam);
router.post('/:teamId/cancel-request', protect, cancelJoinRequest);
router.post('/:teamId/leave', protect, leaveTeam);
router.delete('/:teamId', protect, deleteTeamRequest);

// Squad leader approval routes
router.post('/:teamId/requests/:userId/approve', protect, approveJoinRequest);
router.post('/:teamId/requests/:userId/reject', protect, rejectJoinRequest);

module.exports = router;
