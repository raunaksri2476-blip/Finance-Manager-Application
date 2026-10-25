const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalName: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be greater than 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline date is required'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
