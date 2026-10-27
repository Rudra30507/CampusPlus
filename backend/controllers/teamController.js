const TeamRequest = require('../models/TeamRequest');
const Event = require('../models/Event');

// @desc    Get all squad/team requests for an event
// @route   GET /api/teams/event/:eventId
// @access  Public
const getEventTeams = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const teams = await TeamRequest.find({ event: eventId })
      .populate('creator', 'name email rollNumber')
      .populate('members', 'name email rollNumber')
      .populate('joinRequests.user', 'name email rollNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a squad/team listing
// @route   POST /api/teams/event/:eventId
// @access  Private (Students only)
const createTeamRequest = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { teamName, description, rolesNeeded, batchPreference, slotsTotal } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user already created a team for this event
    const existingTeam = await TeamRequest.findOne({
      event: eventId,
      creator: req.user._id,
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'You have already posted a team listing for this event.',
      });
    }

    const team = await TeamRequest.create({
      event: eventId,
      creator: req.user._id,
      teamName: teamName?.trim() || `${req.user.name.split(' ')[0]}'s Squad`,
      description: description?.trim(),
      rolesNeeded: Array.isArray(rolesNeeded)
        ? rolesNeeded
        : rolesNeeded
        ? rolesNeeded.split(',').map((s) => s.trim()).filter(Boolean)
        : ['General'],
      batchPreference: batchPreference || 'Any Batch',
      slotsTotal: Number(slotsTotal) || 4,
      members: [req.user._id], // Creator is first member
      joinRequests: [],
      status: (Number(slotsTotal) || 4) <= 1 ? 'Full' : 'Open',
    });

    const populatedTeam = await TeamRequest.findById(team._id)
      .populate('creator', 'name email rollNumber')
      .populate('members', 'name email rollNumber')
      .populate('joinRequests.user', 'name email rollNumber');

    res.status(201).json({
      success: true,
      message: 'Squad listing created successfully! Students can now request to join.',
      data: populatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to join an open squad (Requires team creator approval)
// @route   POST /api/teams/:teamId/join
// @access  Private (Students only)
const joinTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const studentId = req.user._id;

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team listing not found' });
    }

    // Check if user is the creator
    if (team.creator.toString() === studentId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You are the squad leader of this team.',
      });
    }

    // Check if already an approved member
    if (team.members.some((m) => m.toString() === studentId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You are already an approved member of this squad.',
      });
    }

    // Check if team is full
    if (team.members.length >= team.slotsTotal) {
      return res.status(400).json({
        success: false,
        message: 'This squad is already complete and at max capacity.',
      });
    }

    // Check existing join request
    const existingReqIndex = team.joinRequests.findIndex(
      (r) => r.user.toString() === studentId.toString()
    );

    if (existingReqIndex !== -1) {
      const existingReq = team.joinRequests[existingReqIndex];
      if (existingReq.status === 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Your join request is already pending approval from the squad leader.',
        });
      }
      if (existingReq.status === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'You are already approved in this squad.',
        });
      }
      // If rejected, re-apply as Pending
      team.joinRequests[existingReqIndex].status = 'Pending';
      team.joinRequests[existingReqIndex].requestedAt = new Date();
    } else {
      team.joinRequests.push({
        user: studentId,
        status: 'Pending',
        requestedAt: new Date(),
      });
    }

    await team.save();

    const updatedTeam = await TeamRequest.findById(teamId)
      .populate('creator', 'name email rollNumber')
      .populate('members', 'name email rollNumber')
      .populate('joinRequests.user', 'name email rollNumber');

    res.json({
      success: true,
      message: `Join request sent to squad leader! ⏳`,
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a join request (Only squad creator can approve)
// @route   POST /api/teams/:teamId/requests/:userId/approve
// @access  Private (Squad creator)
const approveJoinRequest = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team listing not found' });
    }

    if (team.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the squad leader can approve join requests.',
      });
    }

    if (team.members.length >= team.slotsTotal) {
      return res.status(400).json({
        success: false,
        message: 'Squad is already full! Cannot add more members.',
      });
    }

    const reqItem = team.joinRequests.find((r) => r.user.toString() === userId.toString());
    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    reqItem.status = 'Approved';

    // Add to members if not already in members
    if (!team.members.some((m) => m.toString() === userId.toString())) {
      team.members.push(userId);
    }

    if (team.members.length >= team.slotsTotal) {
      team.status = 'Full';
    }

    await team.save();

    const updatedTeam = await TeamRequest.findById(teamId)
      .populate('creator', 'name email rollNumber')
      .populate('members', 'name email rollNumber')
      .populate('joinRequests.user', 'name email rollNumber');

    res.json({
      success: true,
      message: 'Student approved and added to your squad! 🎉',
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a join request (Only squad creator can reject)
// @route   POST /api/teams/:teamId/requests/:userId/reject
// @access  Private (Squad creator)
const rejectJoinRequest = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team listing not found' });
    }

    if (team.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the squad leader can reject join requests.',
      });
    }

    const reqItem = team.joinRequests.find((r) => r.user.toString() === userId.toString());
    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    reqItem.status = 'Rejected';
    await team.save();

    const updatedTeam = await TeamRequest.findById(teamId)
      .populate('creator', 'name email rollNumber')
      .populate('members', 'name email rollNumber')
      .populate('joinRequests.user', 'name email rollNumber');

    res.json({
      success: true,
      message: 'Join request declined.',
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel user's own join request
// @route   POST /api/teams/:teamId/cancel-request
// @access  Private
const cancelJoinRequest = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const studentId = req.user._id;

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    team.joinRequests = team.joinRequests.filter(
      (r) => r.user.toString() !== studentId.toString()
    );
    await team.save();

    const updatedTeam = await TeamRequest.findById(teamId)
      .populate('creator', 'name email rollNumber')
      .populate('members', 'name email rollNumber')
      .populate('joinRequests.user', 'name email rollNumber');

    res.json({
      success: true,
      message: 'Join request cancelled.',
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave a squad (Approved member)
// @route   POST /api/teams/:teamId/leave
// @access  Private
const leaveTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const studentId = req.user._id;

    const team = await TeamRequest.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Creator cannot leave (can delete team instead)
    if (team.creator.toString() === studentId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'As squad leader, you cannot leave. Delete the listing instead.',
      });
    }

    team.members = team.members.filter((m) => m.toString() !== studentId.toString());
    team.joinRequests = team.joinRequests.filter(
      (r) => r.user.toString() !== studentId.toString()
    );
    team.status = 'Open';
    await team.save();

    res.json({
      success: true,
      message: 'You have left the squad.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete squad listing (Creator only)
// @route   DELETE /api/teams/:teamId
// @access  Private (Squad creator)
const deleteTeamRequest = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await TeamRequest.findById(teamId);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this squad' });
    }

    await team.deleteOne();

    res.json({
      success: true,
      message: 'Squad listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventTeams,
  createTeamRequest,
  joinTeam,
  approveJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
  leaveTeam,
  deleteTeamRequest,
};
