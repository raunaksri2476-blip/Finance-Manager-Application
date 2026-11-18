const Notification = require('../models/Notification');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');

/**
 * Automatically check and create system notifications for a user based on real metrics
 */
const checkAndGenerateNotifications = async (userID) => {
  try {
    // 1. Check Budgets
    const budgets = await Budget.find({ userID }).populate('categoryID');
    for (const budget of budgets) {
      if (!budget.categoryID) continue;
      
      // Sum expenses for this budget category in range
      const agg = await Transaction.aggregate([
        {
          $match: {
            userID: budget.userID,
            categoryID: budget.categoryID._id,
            transactionType: 'Expense',
            transactionDate: { $gte: budget.startDate, $lte: budget.endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = agg.length > 0 ? agg[0].total : 0;
      const percentage = (spent / budget.budgetAmount) * 100;
      const catName = budget.categoryID.categoryName;

      if (percentage >= 100) {
        const title = 'Budget Exceeded';
        const message = `Your budget for ${catName} has been exceeded! Spent ₹${spent.toLocaleString()} of ₹${budget.budgetAmount.toLocaleString()}.`;
        await createIfNotExists(userID, title, message, 'danger');
      } else if (percentage >= 80) {
        const title = 'Budget Warning';
        const message = `${catName} budget is ${Math.round(percentage)}% used (₹${spent.toLocaleString()} / ₹${budget.budgetAmount.toLocaleString()}).`;
        await createIfNotExists(userID, title, message, 'warning');
      }
    }

    // 2. Check Goals
    const goals = await Goal.find({ userID });
    for (const goal of goals) {
      const pct = (goal.currentAmount / goal.targetAmount) * 100;
      if (pct >= 100) {
        const title = 'Goal Achieved!';
        const message = `Congratulations! You reached your goal "${goal.goalName}" of ₹${goal.targetAmount.toLocaleString()}.`;
        await createIfNotExists(userID, title, message, 'success');
      } else if (pct >= 85) {
        const title = 'Close to Goal';
        const message = `You are ${Math.round(pct)}% close to reaching your "${goal.goalName}" goal!`;
        await createIfNotExists(userID, title, message, 'info');
      }
    }
  } catch (err) {
    console.error('Notification generator error:', err.message);
  }
};

const createIfNotExists = async (userID, title, message, type) => {
  const existing = await Notification.findOne({ userID, title, message });
  if (!existing) {
    await Notification.create({ userID, title, message, type });
  }
};

module.exports = {
  checkAndGenerateNotifications,
};
