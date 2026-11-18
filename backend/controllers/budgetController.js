const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { checkAndGenerateNotifications } = require('../services/notificationService');

// @desc    Get all budgets for user with calculated spending & status
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userID: req.user._id })
      .populate('categoryID', 'categoryName categoryType icon color')
      .sort({ createdAt: -1 });

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const catId = budget.categoryID ? budget.categoryID._id : null;
        
        // Sum expense transactions in range
        const agg = await Transaction.aggregate([
          {
            $match: {
              userID: req.user._id,
              categoryID: catId,
              transactionType: 'Expense',
              transactionDate: { $gte: budget.startDate, $lte: budget.endDate },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const spent = agg.length > 0 ? agg[0].total : 0;
        const remaining = Math.max(0, budget.budgetAmount - spent);
        const percentage = budget.budgetAmount > 0 ? Math.round((spent / budget.budgetAmount) * 100) : 0;

        let status = 'Healthy';
        if (percentage >= 100) status = 'Exceeded';
        else if (percentage >= 90) status = 'Almost Exceeded';
        else if (percentage >= 70) status = 'Warning';

        return {
          _id: budget._id,
          categoryID: budget.categoryID,
          budgetAmount: budget.budgetAmount,
          startDate: budget.startDate,
          endDate: budget.endDate,
          spent,
          remaining,
          percentage,
          status,
          createdAt: budget.createdAt,
        };
      })
    );

    res.json(budgetsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { categoryID, budgetAmount, startDate, endDate } = req.body;

    if (!categoryID || !budgetAmount) {
      return res.status(400).json({ message: 'Category and budget amount are required' });
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const budget = await Budget.create({
      userID: req.user._id,
      categoryID,
      budgetAmount: Number(budgetAmount),
      startDate: start,
      endDate: end,
    });

    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    const populated = await Budget.findById(budget._id).populate('categoryID', 'categoryName categoryType icon color');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const { categoryID, budgetAmount, startDate, endDate } = req.body;

    const budget = await Budget.findOne({ _id: req.params.id, userID: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (categoryID) budget.categoryID = categoryID;
    if (budgetAmount !== undefined) budget.budgetAmount = Number(budgetAmount);
    if (startDate) budget.startDate = new Date(startDate);
    if (endDate) budget.endDate = new Date(endDate);

    await budget.save();

    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    const updated = await Budget.findById(budget._id).populate('categoryID', 'categoryName categoryType icon color');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userID: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.deleteOne({ _id: budget._id });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
