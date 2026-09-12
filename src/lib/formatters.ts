/**
 * Format Indian Rupee (INR) currency representation
 * e.g., 4850 -> "₹4,850"
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
