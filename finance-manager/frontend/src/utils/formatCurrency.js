/**
 * Format numerical currency value into Indian Currency format (e.g. ₹1,24,500)
 */
export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol}0`;
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absNum);

  return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
};
