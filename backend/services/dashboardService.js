const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Category = require('../models/Category');

const getDashboardData = async (userID) => {
  // 1. Calculate Total Balance across all accounts
  const accounts = await Account.find({ userID });
  const totalBalance = accounts.reduce((acc, account) => acc + (account.balance || 0), 0);

  // 2. Calculate Total Income & Total Expenses
  const totals = await Transaction.aggregate([
    { $match: { userID } },
    {
      $group: {
        _id: '$transactionType',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  totals.forEach((item) => {
    if (item._id === 'Income') totalIncome = item.total;
    if (item._id === 'Expense') totalExpenses = item.total;
  });

  const savings = totalIncome - totalExpenses;

  // 3. Income vs Expenses Monthly Aggregation (last 6 months or all months)
  const monthlyAgg = await Transaction.aggregate([
    { $match: { userID } },
    {
      $group: {
        _id: {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          type: '$transactionType',
        },
        amount: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = {};

  monthlyAgg.forEach((item) => {
    const monthKey = `${monthNames[item._id.month - 1]} ${item._id.year}`;
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    if (item._id.type === 'Income') monthlyMap[monthKey].income = item.amount;
    if (item._id.type === 'Expense') monthlyMap[monthKey].expense = item.amount;
  });

  const incomeVsExpensesMonthly = Object.values(monthlyMap);

  // 4. Expense Breakdown by Category
  const categoryAgg = await Transaction.aggregate([
    { $match: { userID, transactionType: 'Expense' } },
    {
      $group: {
        _id: '$categoryID',
        value: { $sum: '$amount' },
      },
    },
  ]);

  const populatedCategoryBreakdown = await Promise.all(
    categoryAgg.map(async (item) => {
      const category = await Category.findById(item._id);
      return {
        name: category ? category.categoryName : 'Uncategorized',
        value: item.value,
        color: category ? category.color : '#94A3B8',
      };
    })
  );

  // 5. Recent Transactions (latest 7)
  const recentTransactions = await Transaction.find({ userID })
    .populate('accountID', 'accountName accountType')
    .populate('categoryID', 'categoryName categoryType icon color')
    .sort({ transactionDate: -1, createdAt: -1 })
    .limit(7);

  // 6. Budget Overview
  const budgets = await Budget.find({ userID }).populate('categoryID');
  const budgetOverview = await Promise.all(
    budgets.map(async (budget) => {
      const catId = budget.categoryID ? budget.categoryID._id : null;
      const spentAgg = await Transaction.aggregate([
        {
          $match: {
            userID,
            categoryID: catId,
            transactionType: 'Expense',
            transactionDate: { $gte: budget.startDate, $lte: budget.endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = spentAgg.length > 0 ? spentAgg[0].total : 0;
      const remaining = Math.max(0, budget.budgetAmount - spent);
      const percentage = budget.budgetAmount > 0 ? Math.round((spent / budget.budgetAmount) * 100) : 0;
      
      let status = 'Healthy';
      if (percentage >= 100) status = 'Exceeded';
      else if (percentage >= 90) status = 'Almost Exceeded';
      else if (percentage >= 70) status = 'Warning';

      return {
        _id: budget._id,
        categoryName: budget.categoryID ? budget.categoryID.categoryName : 'Deleted Category',
        budgetAmount: budget.budgetAmount,
        spent,
        remaining,
        percentage,
        status,
      };
    })
  );

  // 7. Goal Overview
  const goals = await Goal.find({ userID }).sort({ deadline: 1 });
  const goalOverview = goals.map((goal) => {
    const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    return {
      _id: goal._id,
      goalName: goal.goalName,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remaining,
      percentage,
      deadline: goal.deadline,
    };
  });

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savings,
    incomeVsExpensesMonthly,
    expenseByCategory: populatedCategoryBreakdown,
    recentTransactions,
    budgetOverview,
    goalOverview,
  };
};

module.exports = {
  getDashboardData,
};
