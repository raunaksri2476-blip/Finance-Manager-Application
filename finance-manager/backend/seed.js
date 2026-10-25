const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Account = require('./models/Account');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing old seed data for demo user...');
    const demoEmail = 'demo@financemanager.com';
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      await Account.deleteMany({ userID: existingUser._id });
      await Category.deleteMany({ userID: existingUser._id });
      await Transaction.deleteMany({ userID: existingUser._id });
      await Budget.deleteMany({ userID: existingUser._id });
      await Goal.deleteMany({ userID: existingUser._id });
      await Notification.deleteMany({ userID: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    console.log('Creating demo user Raunak...');
    const user = await User.create({
      name: 'Raunak',
      email: demoEmail,
      password: 'password123',
      phone: '+91 9876543210',
      currency: 'INR',
    });

    console.log('Creating categories...');
    const categoriesData = [
      { categoryName: 'Food', categoryType: 'Expense', icon: 'Utensils', color: '#EF4444' },
      { categoryName: 'Transport', categoryType: 'Expense', icon: 'Car', color: '#F59E0B' },
      { categoryName: 'Shopping', categoryType: 'Expense', icon: 'ShoppingBag', color: '#EC4899' },
      { categoryName: 'Bills', categoryType: 'Expense', icon: 'Receipt', color: '#3B82F6' },
      { categoryName: 'Entertainment', categoryType: 'Expense', icon: 'Film', color: '#8B5CF6' },
      { categoryName: 'Education', categoryType: 'Expense', icon: 'GraduationCap', color: '#10B981' },
      { categoryName: 'Healthcare', categoryType: 'Expense', icon: 'HeartPulse', color: '#14B8A6' },
      { categoryName: 'Other', categoryType: 'Expense', icon: 'Tag', color: '#6B7280' },
      { categoryName: 'Salary', categoryType: 'Income', icon: 'Briefcase', color: '#10B981' },
      { categoryName: 'Investment', categoryType: 'Income', icon: 'TrendingUp', color: '#06B6D4' },
      { categoryName: 'Freelance', categoryType: 'Income', icon: 'Laptop', color: '#6366F1' },
      { categoryName: 'Other', categoryType: 'Income', icon: 'Coins', color: '#8B5CF6' },
    ];

    const insertedCategories = await Category.insertMany(
      categoriesData.map((c) => ({ ...c, userID: user._id }))
    );

    const catMap = {};
    insertedCategories.forEach((c) => {
      catMap[c.categoryName] = c._id;
    });

    console.log('Creating accounts...');
    const hdfc = await Account.create({
      userID: user._id,
      accountName: 'HDFC Savings',
      accountType: 'Savings Account',
      balance: 45000,
      description: 'Primary salary savings account',
    });

    const sbi = await Account.create({
      userID: user._id,
      accountName: 'SBI Account',
      accountType: 'Bank Account',
      balance: 30500,
      description: 'Secondary bank account',
    });

    const wallet = await Account.create({
      userID: user._id,
      accountName: 'Cash Wallet',
      accountType: 'Cash',
      balance: 4000,
      description: 'Physical cash on hand',
    });

    console.log('Creating transactions...');
    const today = new Date();
    const subDays = (d) => new Date(today.getTime() - d * 24 * 60 * 60 * 1000);

    const transactions = [
      {
        userID: user._id,
        accountID: hdfc._id,
        categoryID: catMap['Salary'],
        amount: 75000,
        transactionType: 'Income',
        transactionDate: subDays(15),
        description: 'Monthly Salary Credit',
      },
      {
        userID: user._id,
        accountID: wallet._id,
        categoryID: catMap['Food'],
        amount: 450,
        transactionType: 'Expense',
        transactionDate: subDays(14),
        description: 'Swiggy Dinner Order',
      },
      {
        userID: user._id,
        accountID: sbi._id,
        categoryID: catMap['Shopping'],
        amount: 2499,
        transactionType: 'Expense',
        transactionDate: subDays(12),
        description: 'Amazon Headphones',
      },
      {
        userID: user._id,
        accountID: wallet._id,
        categoryID: catMap['Transport'],
        amount: 280,
        transactionType: 'Expense',
        transactionDate: subDays(10),
        description: 'Uber Ride to Office',
      },
      {
        userID: user._id,
        accountID: sbi._id,
        categoryID: catMap['Education'],
        amount: 25000,
        transactionType: 'Expense',
        transactionDate: subDays(8),
        description: 'College Semester Fees',
      },
      {
        userID: user._id,
        accountID: hdfc._id,
        categoryID: catMap['Bills'],
        amount: 2100,
        transactionType: 'Expense',
        transactionDate: subDays(6),
        description: 'Electricity Bill',
      },
      {
        userID: user._id,
        accountID: wallet._id,
        categoryID: catMap['Food'],
        amount: 620,
        transactionType: 'Expense',
        transactionDate: subDays(4),
        description: 'Zomato Lunch',
      },
      {
        userID: user._id,
        accountID: hdfc._id,
        categoryID: catMap['Entertainment'],
        amount: 649,
        transactionType: 'Expense',
        transactionDate: subDays(3),
        description: 'Netflix Monthly Subscription',
      },
      {
        userID: user._id,
        accountID: hdfc._id,
        categoryID: catMap['Food'],
        amount: 3500,
        transactionType: 'Expense',
        transactionDate: subDays(1),
        description: 'Monthly Supermarket Grocery',
      },
    ];

    await Transaction.insertMany(transactions);

    console.log('Creating budgets...');
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    await Budget.create([
      {
        userID: user._id,
        categoryID: catMap['Food'],
        budgetAmount: 8000,
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
      {
        userID: user._id,
        categoryID: catMap['Shopping'],
        budgetAmount: 5000,
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
      {
        userID: user._id,
        categoryID: catMap['Bills'],
        budgetAmount: 5000,
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
    ]);

    console.log('Creating financial goals...');
    const addMonths = (m) => new Date(today.getFullYear(), today.getMonth() + m, today.getDate());

    await Goal.create([
      {
        userID: user._id,
        goalName: 'New Laptop',
        targetAmount: 80000,
        currentAmount: 35000,
        deadline: addMonths(6),
        description: 'Savings for M3 MacBook Pro',
      },
      {
        userID: user._id,
        goalName: 'Emergency Fund',
        targetAmount: 150000,
        currentAmount: 75000,
        deadline: addMonths(12),
        description: '6 months emergency expenses safety cushion',
      },
      {
        userID: user._id,
        goalName: 'Travel Fund',
        targetAmount: 50000,
        currentAmount: 20000,
        deadline: addMonths(4),
        description: 'Goa Vacation Trip',
      },
    ]);

    console.log('Creating sample notifications...');
    await Notification.create([
      {
        userID: user._id,
        title: 'Salary Credited',
        message: 'Your monthly salary of ₹75,000 has been credited to HDFC Savings.',
        type: 'success',
        isRead: true,
      },
      {
        userID: user._id,
        title: 'Food Budget Alert',
        message: 'Food budget is 57% used (₹4,570 of ₹8,000).',
        type: 'info',
        isRead: false,
      },
      {
        userID: user._id,
        title: 'Emergency Fund Progress',
        message: 'You are 50% close to reaching your Emergency Fund goal!',
        type: 'info',
        isRead: false,
      },
    ]);

    console.log('Seed completed successfully!');
    console.log('Demo Credentials -> Email: demo@financemanager.com | Password: password123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
};

seedData();
