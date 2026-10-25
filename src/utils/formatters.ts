/**
 * Format numbers according to Indian Rupee (INR) standard format
 * Example: 124500.5 -> "₹1,24,500.50"
 */
export const formatINR = (amount: number, showSymbol = true): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(absAmount);

  const prefix = isNegative ? '- ' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${prefix}${symbol}${formatted}`;
};

/**
 * Format date string into readable format (e.g., "08 Oct 2026")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Dynamic greeting based on current hour of day
 */
export const getGreeting = (name: string = 'Raunak'): string => {
  const hour = new Date().getHours();
  let timeOfDay = 'Good evening';
  if (hour < 12) timeOfDay = 'Good morning';
  else if (hour < 17) timeOfDay = 'Good afternoon';
  
  return `${timeOfDay}, ${name}`;
};
