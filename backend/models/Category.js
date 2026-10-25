const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for global default categories
      index: true,
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    categoryType: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true,
    },
    icon: {
      type: String,
      default: 'Tag',
    },
    color: {
      type: String,
      default: '#6B7280',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
