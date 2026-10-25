const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    budgetAmount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget amount must be greater than 0'],
    },
    startDate: {
      type: Date,
      required: true,
      default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
    endDate: {
      type: Date,
      required: true,
      default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59),
    },
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
