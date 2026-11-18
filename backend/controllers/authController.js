const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Category = require('../models/Category');

// Default categories to seed for new registered users
const DEFAULT_CATEGORIES = [
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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
    });

    if (user) {
      // Create default categories for the user
      const userCategories = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userID: user._id,
      }));
      await Category.insertMany(userCategories);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        dateFormat: user.dateFormat,
        theme: user.theme,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.currency = req.body.currency || user.currency;
      user.dateFormat = req.body.dateFormat || user.dateFormat;
      user.theme = req.body.theme || user.theme;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        currency: updatedUser.currency,
        dateFormat: updatedUser.dateFormat,
        theme: updatedUser.theme,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Incorrect current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
