const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { checkAndGenerateNotifications } = require('../services/notificationService');

// @desc    Get all transactions for user with filtering, search, sorting
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { search, type, category, account, startDate, endDate, sortBy, page = 1, limit = 50 } = req.query;

    const query = { userID: req.user._id };

    if (type) query.transactionType = type;
    if (category) query.categoryID = category;
    if (account) query.accountID = account;

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = end;
      }
    }

    let sortOptions = { transactionDate: -1, createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { transactionDate: 1, createdAt: 1 };
    if (sortBy === 'highest') sortOptions = { amount: -1 };
    if (sortBy === 'lowest') sortOptions = { amount: 1 };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('accountID', 'accountName accountType')
      .populate('categoryID', 'categoryName categoryType icon color')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new transaction & update account balance
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { accountID, categoryID, amount, transactionType, transactionDate, description } = req.body;

    if (!accountID || !categoryID || amount === undefined || !transactionType) {
      return res.status(400).json({ message: 'Account, category, amount, and type are required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const account = await Account.findOne({ _id: accountID, userID: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Selected account not found' });
    }

    const transaction = await Transaction.create({
      userID: req.user._id,
      accountID,
      categoryID,
      amount: numAmount,
      transactionType,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      description: description || '',
    });

    // Update account balance
    if (transactionType === 'Income') {
      account.balance += numAmount;
    } else if (transactionType === 'Expense') {
      account.balance -= numAmount;
    }
    await account.save();

    // Trigger notification evaluations in background
    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    const populatedTx = await Transaction.findById(transaction._id)
      .populate('accountID', 'accountName accountType')
      .populate('categoryID', 'categoryName categoryType icon color');

    res.status(201).json(populatedTx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userID: req.user._id })
      .populate('accountID', 'accountName accountType')
      .populate('categoryID', 'categoryName categoryType icon color');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction & adjust account balances safely
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { accountID, categoryID, amount, transactionType, transactionDate, description } = req.body;

    const oldTransaction = await Transaction.findOne({ _id: req.params.id, userID: req.user._id });
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Reverse old transaction impact on old account
    const oldAccount = await Account.findOne({ _id: oldTransaction.accountID, userID: req.user._id });
    if (oldAccount) {
      if (oldTransaction.transactionType === 'Income') {
        oldAccount.balance -= oldTransaction.amount;
      } else if (oldTransaction.transactionType === 'Expense') {
        oldAccount.balance += oldTransaction.amount;
      }
      await oldAccount.save();
    }

    // Update properties
    const newAccountID = accountID || oldTransaction.accountID;
    const newType = transactionType || oldTransaction.transactionType;
    const newAmount = amount !== undefined ? Number(amount) : oldTransaction.amount;

    if (newAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    oldTransaction.accountID = newAccountID;
    if (categoryID) oldTransaction.categoryID = categoryID;
    oldTransaction.amount = newAmount;
    oldTransaction.transactionType = newType;
    if (transactionDate) oldTransaction.transactionDate = new Date(transactionDate);
    if (description !== undefined) oldTransaction.description = description;

    await oldTransaction.save();

    // Apply new transaction impact to target account
    const targetAccount = await Account.findOne({ _id: newAccountID, userID: req.user._id });
    if (targetAccount) {
      if (newType === 'Income') {
        targetAccount.balance += newAmount;
      } else if (newType === 'Expense') {
        targetAccount.balance -= newAmount;
      }
      await targetAccount.save();
    }

    // Trigger notifications
    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    const updatedTx = await Transaction.findById(oldTransaction._id)
      .populate('accountID', 'accountName accountType')
      .populate('categoryID', 'categoryName categoryType icon color');

    res.json(updatedTx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction & reverse balance effect
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userID: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Reverse balance effect
    const account = await Account.findOne({ _id: transaction.accountID, userID: req.user._id });
    if (account) {
      if (transaction.transactionType === 'Income') {
        account.balance -= transaction.amount;
      } else if (transaction.transactionType === 'Expense') {
        account.balance += transaction.amount;
      }
      await account.save();
    }

    await Transaction.deleteOne({ _id: transaction._id });

    // Trigger notifications
    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    res.json({ message: 'Transaction removed and account balance updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
