const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Category = require('../models/Category');

const getMonthlyReport = async (userID, year, month) => {
  const accounts = await Account.find({ userID });
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const transactions = await Transaction.find({ userID })
    .populate('accountID', 'accountName')
    .populate('categoryID', 'categoryName categoryType color')
    .sort({ transactionDate: -1 });

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    if (tx.transactionType === 'Income') totalIncome += tx.amount;
    if (tx.transactionType === 'Expense') totalExpenses += tx.amount;
  });

  const savings = totalIncome - totalExpenses;

  // Group by category
  const categoryMap = {};
  transactions.forEach((tx) => {
    if (tx.transactionType === 'Expense' && tx.categoryID) {
      const catName = tx.categoryID.categoryName;
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, total: 0, color: tx.categoryID.color };
      }
      categoryMap[catName].total += tx.amount;
    }
  });

  const categorySpending = Object.values(categoryMap);

  // Budget status
  const budgets = await Budget.find({ userID }).populate('categoryID');
  const budgetPerformance = await Promise.all(
    budgets.map(async (b) => {
      const catId = b.categoryID ? b.categoryID._id : null;
      const txs = await Transaction.find({
        userID,
        categoryID: catId,
        transactionType: 'Expense',
        transactionDate: { $gte: b.startDate, $lte: b.endDate },
      });
      const spent = txs.reduce((sum, t) => sum + t.amount, 0);
      return {
        category: b.categoryID ? b.categoryID.categoryName : 'Deleted',
        budgetAmount: b.budgetAmount,
        spent,
        remaining: Math.max(0, b.budgetAmount - spent),
        percentage: Math.round((spent / b.budgetAmount) * 100),
      };
    })
  );

  // Goals status
  const goals = await Goal.find({ userID });
  const goalProgress = goals.map((g) => ({
    goalName: g.goalName,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    percentage: Math.round((g.currentAmount / g.targetAmount) * 100),
    deadline: g.deadline,
  }));

  return {
    reportDate: new Date(),
    totalBalance,
    totalIncome,
    totalExpenses,
    savings,
    accounts: accounts.map((a) => ({ name: a.accountName, type: a.accountType, balance: a.balance })),
    categorySpending,
    budgetPerformance,
    goalProgress,
    recentTransactions: transactions.slice(0, 15),
  };
};

module.exports = {
  getMonthlyReport,
};
