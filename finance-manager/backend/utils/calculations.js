/**
 * Financial calculation helper utilities
 */

// Format numbers into Indian currency format or standard format
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Calculate percentage progress safely
const calculatePercentage = (current, target) => {
  if (!target || target <= 0) return 0;
  const pct = (current / target) * 100;
  return Math.min(Math.round(pct * 10) / 10, 999.9);
};

// Determine budget status
const getBudgetStatus = (percentage) => {
  if (percentage >= 100) return 'Exceeded';
  if (percentage >= 90) return 'Almost Exceeded';
  if (percentage >= 70) return 'Warning';
  return 'Healthy';
};

module.exports = {
  formatINR,
  calculatePercentage,
  getBudgetStatus,
};
