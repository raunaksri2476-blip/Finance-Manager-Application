const Goal = require('../models/Goal');
const { checkAndGenerateNotifications } = require('../services/notificationService');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userID: req.user._id }).sort({ deadline: 1 });
    
    const formattedGoals = goals.map((goal) => {
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
        description: goal.description,
        createdAt: goal.createdAt,
      };
    });

    res.json(formattedGoals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create financial goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, currentAmount, deadline, description } = req.body;

    if (!goalName || !targetAmount || !deadline) {
      return res.status(400).json({ message: 'Goal name, target amount, and deadline are required' });
    }

    const goal = await Goal.create({
      userID: req.user._id,
      goalName,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      deadline: new Date(deadline),
      description: description || '',
    });

    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, currentAmount, deadline, description } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, userID: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goalName !== undefined) goal.goalName = goalName;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (deadline !== undefined) goal.deadline = new Date(deadline);
    if (description !== undefined) goal.description = description;

    const updatedGoal = await goal.save();

    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add money to goal
// @route   PUT /api/goals/:id/add-money
// @access  Private
const addMoneyToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const addVal = Number(amount);

    if (isNaN(addVal) || addVal <= 0) {
      return res.status(400).json({ message: 'Please enter a valid amount' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userID: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount += addVal;
    const updatedGoal = await goal.save();

    checkAndGenerateNotifications(req.user._id).catch((err) => console.error(err));

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userID: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Goal.deleteOne({ _id: goal._id });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  addMoneyToGoal,
  deleteGoal,
};
