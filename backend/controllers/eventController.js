const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer only)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, venue, capacity, banner, organizerName } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity: Number(capacity) || 100,
      banner: banner || undefined,
      organizerName: organizerName || req.user.name,
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events with filters (category, search, status)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;

    let query = {};

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Keyword Search in title, description, or venue
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort order
    let sortOptions = { date: 1 }; // Default: earliest upcoming first
    if (sort === 'popular') {
      sortOptions = { registeredCount: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email department')
      .sort(sortOptions);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email department');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event and related registrations
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    // Cascade delete registrations
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event and related registrations removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics (Total events, total registrations, etc.)
// @route   GET /api/events/stats/summary
// @access  Public
const getEventStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments({ status: { $ne: 'Cancelled' } });
    
    // Total unique students who currently hold at least one active booked pass
    const bookedStudentIds = await Registration.distinct('student', { status: { $ne: 'Cancelled' } });
    const bookedUsers = bookedStudentIds.length;

    // Total students registered in the college portal
    const totalStudents = await User.countDocuments({ role: 'student' });

    const technicalCount = await Event.countDocuments({ category: 'Technical' });
    const culturalCount = await Event.countDocuments({ category: 'Cultural' });
    const sportsCount = await Event.countDocuments({ category: 'Sports' });
    const workshopCount = await Event.countDocuments({ category: 'Workshop' });
    const seminarCount = await Event.countDocuments({ category: 'Seminar' });

    res.json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        bookedUsers,
        totalStudents,
        categories: {
          Technical: technicalCount,
          Cultural: culturalCount,
          Sports: sportsCount,
          Workshop: workshopCount,
          Seminar: seminarCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventStats,
};
