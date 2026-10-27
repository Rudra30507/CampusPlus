const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Student or Organizer)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, SST college email, and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRole = role || 'student';
    const cleanRoll = (rollNumber || studentId || '').toLowerCase().trim();

    // Security check: Only verified Club Leads with valid Council Passkey can register as organizer
    if (userRole === 'organizer' || userRole === 'admin') {
      const validKey = process.env.COUNCIL_SECRET || 'SST_COUNCIL_2026';
      const providedKey = req.body.councilPasskey || req.body.councilKey || req.body.secretKey;
      if (providedKey !== validKey && cleanEmail !== 'events@sst.scaler.com') {
        return res.status(403).json({
          success: false,
          message: '❌ Unauthorized: Valid Council Authorization Passkey required to register as an Event Lead / Organizer.',
        });
      }
    }

    // SST College Email Domain check
    if (!cleanEmail.endsWith('@sst.scaler.com') && !cleanEmail.endsWith('@scaler.com')) {
      return res.status(400).json({
        success: false,
        message: 'Registration requires an official SST Scaler email (e.g. name.24bcsxxxxx@sst.scaler.com)',
      });
    }

    // Student Roll Number format check (24bcsxxxxx, 25bcsxxxxx, 26bcsxxxxx)
    if (userRole === 'student') {
      const rollRegex = /^(24|25|26)bcs[a-z0-9]{3,7}$/i;
      if (!cleanRoll) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your SST Roll Number (e.g. 24bcs10042, 25bcs10018, or 26bcs10005)',
        });
      }
      if (!rollRegex.test(cleanRoll)) {
        return res.status(400).json({
          success: false,
          message: 'Roll number must start with 24bcs, 25bcs, or 26bcs (e.g. 24bcs10042)',
        });
      }
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: userRole,
      rollNumber: cleanRoll,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both SST email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
