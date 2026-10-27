/**
 * Request validation utilities for transactions and budgets.
 * Validates data types, date formats, amounts, and category enums.
 */

export const ALLOWED_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Health',
  'Income',
  'Other',
];

export const ALLOWED_EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Health',
  'Other',
];

export const ALLOWED_TRANSACTION_TYPES = ['INCOME', 'EXPENSE'];

export const ALLOWED_PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other',
];

const ISO_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const ISO_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Validate and round a monetary amount to 2 decimal places.
 * Ensures the number is finite, strictly positive, and not NaN or Infinity.
 */
export function validateAmount(amount) {
  if (amount === undefined || amount === null || typeof amount !== 'number') {
    return { valid: false, error: 'Amount must be a numeric value' };
  }
  if (!isFinite(amount) || isNaN(amount)) {
    return { valid: false, error: 'Amount must be a finite number' };
  }
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be strictly greater than 0' };
  }

  // Check decimal precision (max 2 decimal places)
  const parts = amount.toString().split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
  }

  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return { valid: true, value: rounded };
}

/**
 * Validate transaction creation payload
 */
export function validateTransactionInput(data, isUpdate = false) {
  const errors = {};

  // Description
  if (!isUpdate || data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.description = 'Description is required and must not be empty';
    } else if (data.description.trim().length > 200) {
      errors.description = 'Description must not exceed 200 characters';
    }
  }

  // Amount
  if (!isUpdate || data.amount !== undefined) {
    const amountRes = validateAmount(data.amount);
    if (!amountRes.valid) {
      errors.amount = amountRes.error;
    }
  }

  // Type
  if (!isUpdate || data.type !== undefined) {
    if (!ALLOWED_TRANSACTION_TYPES.includes(data.type)) {
      errors.type = `Type must be one of: ${ALLOWED_TRANSACTION_TYPES.join(', ')}`;
    }
  }

  // Category
  if (!isUpdate || data.category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(data.category)) {
      errors.category = `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`;
    }
  }

  // Transaction Date (YYYY-MM-DD)
  if (!isUpdate || data.transactionDate !== undefined) {
    if (typeof data.transactionDate !== 'string' || !ISO_DATE_REGEX.test(data.transactionDate)) {
      errors.transactionDate = 'Transaction date must be a valid ISO date in YYYY-MM-DD format';
    } else {
      const [yStr, mStr, dStr] = data.transactionDate.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const d = parseInt(dStr, 10);
      const dateObj = new Date(Date.UTC(y, m - 1, d));

      if (
        dateObj.getUTCFullYear() !== y ||
        dateObj.getUTCMonth() !== m - 1 ||
        dateObj.getUTCDate() !== d
      ) {
        errors.transactionDate = 'Transaction date is not a valid calendar date';
      }
    }
  }

  // Payment Method
  if (!isUpdate || data.paymentMethod !== undefined) {
    if (!ALLOWED_PAYMENT_METHODS.includes(data.paymentMethod)) {
      errors.paymentMethod = `Payment method must be one of: ${ALLOWED_PAYMENT_METHODS.join(', ')}`;
    }
  }

  // Optional notes
  if (data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== 'string') {
      errors.notes = 'Notes must be a string';
    } else if (data.notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate budget input payload
 */
export function validateBudgetInput(data, isUpdate = false) {
  const errors = {};

  // Month (YYYY-MM)
  if (!isUpdate || data.month !== undefined) {
    if (typeof data.month !== 'string' || !ISO_MONTH_REGEX.test(data.month)) {
      errors.month = 'Month must be in YYYY-MM format (e.g. 2026-10)';
    }
  }

  // Category: 'OVERALL' sentinel or valid expense category
  if (!isUpdate || data.category !== undefined) {
    const allowedBudgetCategories = ['OVERALL', ...ALLOWED_EXPENSE_CATEGORIES];
    if (!allowedBudgetCategories.includes(data.category)) {
      errors.category = `Budget category must be 'OVERALL' or one of: ${ALLOWED_EXPENSE_CATEGORIES.join(', ')}`;
    }
  }

  // Limit Amount
  if (!isUpdate || data.limitAmount !== undefined) {
    const amountRes = validateAmount(data.limitAmount);
    if (!amountRes.valid) {
      errors.limitAmount = amountRes.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate month query parameter (e.g. ?month=2026-10)
 */
export function validateMonthQuery(monthStr) {
  if (!monthStr || typeof monthStr !== 'string' || !ISO_MONTH_REGEX.test(monthStr)) {
    return {
      valid: false,
      error: 'Query parameter "month" must be in YYYY-MM format (e.g. 2026-10)',
    };
  }
  return { valid: true, value: monthStr };
}
