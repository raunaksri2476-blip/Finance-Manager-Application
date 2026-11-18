const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get all accounts for user
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userID: req.user._id }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res) => {
  try {
    const { accountName, accountType, balance, description } = req.body;

    if (!accountName) {
      return res.status(400).json({ message: 'Account name is required' });
    }

    const account = await Account.create({
      userID: req.user._id,
      accountName,
      accountType: accountType || 'Bank Account',
      balance: balance !== undefined ? Number(balance) : 0,
      description: description || '',
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get account by ID
// @route   GET /api/accounts/:id
// @access  Private
const getAccountById = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userID: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Get recent transactions for this account
    const transactions = await Transaction.find({ accountID: account._id, userID: req.user._id })
      .populate('categoryID', 'categoryName categoryType color')
      .sort({ transactionDate: -1 });

    res.json({ account, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private
const updateAccount = async (req, res) => {
  try {
    const { accountName, accountType, balance, description } = req.body;

    const account = await Account.findOne({ _id: req.params.id, userID: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (accountName !== undefined) account.accountName = accountName;
    if (accountType !== undefined) account.accountType = accountType;
    if (balance !== undefined) account.balance = Number(balance);
    if (description !== undefined) account.description = description;

    const updatedAccount = await account.save();
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userID: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Delete associated transactions
    await Transaction.deleteMany({ accountID: account._id, userID: req.user._id });

    await Account.deleteOne({ _id: account._id });
    res.json({ message: 'Account and associated transactions removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAccounts,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount,
};
