const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['Bank Account', 'Savings Account', 'Cash', 'Credit Card', 'Wallet', 'Other'],
      default: 'Bank Account',
    },
    balance: {
      type: Number,
      default: 0,
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

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
