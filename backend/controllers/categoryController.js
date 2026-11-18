const Category = require('../models/Category');

// @desc    Get all categories for user (including default categories)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ userID: req.user._id }, { userID: null }],
    }).sort({ categoryName: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { categoryName, categoryType, icon, color } = req.body;

    if (!categoryName || !categoryType) {
      return res.status(400).json({ message: 'Category name and type are required' });
    }

    const category = await Category.create({
      userID: req.user._id,
      categoryName,
      categoryType,
      icon: icon || 'Tag',
      color: color || '#6B7280',
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { categoryName, categoryType, icon, color } = req.body;

    const category = await Category.findOne({ _id: req.params.id, userID: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found or default category cannot be modified' });
    }

    if (categoryName !== undefined) category.categoryName = categoryName;
    if (categoryType !== undefined) category.categoryType = categoryType;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userID: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found or default category cannot be deleted' });
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
