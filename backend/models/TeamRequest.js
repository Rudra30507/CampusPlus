const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please describe what team members or roles you are looking for'],
    },
    rolesNeeded: {
      type: [String],
      default: ['Any Role'],
    },
    batchPreference: {
      type: String,
      enum: ['Any Batch', '24BCS', '25BCS', '26BCS'],
      default: 'Any Batch',
    },
    slotsTotal: {
      type: Number,
      default: 4,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    joinRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending',
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['Open', 'Full'],
      default: 'Open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamRequest', teamRequestSchema);
