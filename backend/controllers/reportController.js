const { getDashboardData } = require('../services/dashboardService');
const { getMonthlyReport: getMonthlyData } = require('../services/reportService');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// @desc    Get dashboard analytics report
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardReport = async (req, res) => {
  try {
    const data = await getDashboardData(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly full report
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = async (req, res) => {
  try {
    const data = await getMonthlyData(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category report
// @route   GET /api/reports/categories
// @access  Private
const getCategoryReport = async (req, res) => {
  try {
    const categoryReport = await Transaction.aggregate([
      { $match: { userID: req.user._id, transactionType: 'Expense' } },
      {
        $group: {
          _id: '$categoryID',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          categoryName: '$categoryDetails.categoryName',
          color: '$categoryDetails.color',
          icon: '$categoryDetails.icon',
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json(categoryReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get account report
// @route   GET /api/reports/accounts
// @access  Private
const getAccountReport = async (req, res) => {
  try {
    const accounts = await Account.find({ userID: req.user._id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardReport,
  getMonthlyReport,
  getCategoryReport,
  getAccountReport,
};
