/**
 * Currency and financial calculation helpers.
 * Ensures consistent Indian Rupee (₹) formatting and decimal precision.
 */

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/**
 * Format a numeric amount into Indian Rupee representation (e.g. ₹1,250.00)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0.00';
  return INR_FORMATTER.format(amount);
}

/**
 * Format compact INR for charts and mobile cards (e.g. ₹12.5K)
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  return COMPACT_INR_FORMATTER.format(amount);
}

/**
 * Round a number safely to 2 decimal places to avoid IEEE 754 floating point issues.
 */
export function roundTo2Decimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Compute budget alert level based on percentage used
 * Thresholds: 75%, 90%, 100%
 */
export function getBudgetAlertLevel(percentage: number): 'normal' | 'warning_75' | 'warning_90' | 'exceeded_100' {
  if (percentage >= 100) return 'exceeded_100';
  if (percentage >= 90) return 'warning_90';
  if (percentage >= 75) return 'warning_75';
  return 'normal';
}

/**
 * Get color styling for an alert level
 */
export function getAlertLevelStyles(level: 'normal' | 'warning_75' | 'warning_90' | 'exceeded_100') {
  switch (level) {
    case 'exceeded_100':
      return {
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        progressBar: 'bg-red-600',
        label: 'Budget Exceeded (≥100%)',
        textColor: 'text-red-700',
      };
    case 'warning_90':
      return {
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        progressBar: 'bg-orange-500',
        label: 'Critical Warning (≥90%)',
        textColor: 'text-orange-700',
      };
    case 'warning_75':
      return {
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        progressBar: 'bg-amber-500',
        label: 'Caution (≥75%)',
        textColor: 'text-amber-700',
      };
    case 'normal':
    default:
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        progressBar: 'bg-indigo-600',
        label: 'On Track (<75%)',
        textColor: 'text-emerald-700',
      };
  }
}
