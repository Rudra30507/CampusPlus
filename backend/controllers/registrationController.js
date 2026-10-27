const Registration = require('../models/Registration');
const Event = require('../models/Event');
const crypto = require('crypto');

// Helper to generate Unique Ticket ID (e.g. TKT-7A4B9F)
const generateTicketId = () => {
  return `TKT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

// @desc    Register / RSVP for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student & Organizer)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Organizers cannot participate/register for events as attendees
    if (req.user.role === 'organizer' || req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Event organizers and council leads cannot participate as attendees in events.',
      });
    }

    // Check if already reached maximum capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Housefull! Event has reached maximum capacity.',
      });
    }

    // Check if already registered
    const alreadyRegistered = await Registration.findOne({
      event: eventId,
      student: studentId,
      status: { $in: ['Registered', 'Attended'] },
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
        ticketId: alreadyRegistered.ticketId,
      });
    }

    // Generate unique ticket ID
    let ticketId = generateTicketId();

    const registration = await Registration.create({
      event: eventId,
      student: studentId,
      ticketId,
      status: 'Registered',
    });

    // Increment registered count on Event
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registeredCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your pass is ready.',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:registrationId
// @access  Private (Student)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration pass not found',
      });
    }

    // Ensure only the student who registered can cancel
    if (registration.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration',
      });
    }

    const eventId = registration.event;
    await registration.deleteOne();

    // Decrement registered count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registeredCount: -1 },
    });

    res.json({
      success: true,
      message: 'Registration successfully cancelled',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events registered by the logged-in student
// @route   GET /api/registrations/my-passes
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      student: req.user._id,
      status: { $in: ['Registered', 'Attended'] },
    })
      .populate({
        path: 'event',
        select: 'title description category date time venue banner organizerName',
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendees registered for a specific event (Organizer view)
// @route   GET /api/registrations/event/:eventId/attendees
// @access  Private (Organizer)
const getEventAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const attendees = await Registration.find({
      event: eventId,
      status: { $in: ['Registered', 'Attended'] },
    })
      .populate('student', 'name email rollNumber')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      event: {
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
      },
      count: attendees.length,
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify ticket at gate / check-in entry
// @route   POST /api/registrations/verify-ticket
// @access  Private (Organizer only)
const verifyTicketPass = async (req, res, next) => {
  try {
    const { ticketId, eventId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'Please provide ticket code' });
    }

    const registration = await Registration.findOne({ ticketId: ticketId.trim().toUpperCase() })
      .populate('student', 'name email rollNumber')
      .populate('event', 'title venue date time');

    if (!registration) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `❌ Invalid Ticket: No pass found matching "${ticketId}" in SST database.`,
      });
    }

    // Check if event matches (if eventId provided)
    if (eventId && registration.event._id.toString() !== eventId.toString()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `⚠️ Event Mismatch: This pass belongs to "${registration.event.title}", not this event!`,
        data: registration,
      });
    }

    // Check if already checked in
    if (registration.status === 'Attended') {
      return res.status(200).json({
        success: true,
        valid: false,
        alreadyAttended: true,
        message: `⚠️ ALREADY CHECKED IN: This pass was already verified for ${registration.student?.name} (${registration.student?.rollNumber?.toUpperCase()})!`,
        data: registration,
      });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `❌ CANCELLED PASS: This ticket was cancelled by the student and is void.`,
        data: registration,
      });
    }

    // Mark as Attended in database
    registration.status = 'Attended';
    await registration.save();

    res.json({
      success: true,
      valid: true,
      message: `✅ ENTRY GRANTED: Welcome ${registration.student?.name} (${registration.student?.rollNumber?.toUpperCase()}) to ${registration.event?.title}!`,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  verifyTicketPass,
};
