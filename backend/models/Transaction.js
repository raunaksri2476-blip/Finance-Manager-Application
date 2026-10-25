const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account is required'],
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    transactionType: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
