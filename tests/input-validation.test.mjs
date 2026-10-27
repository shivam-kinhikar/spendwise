import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAmount,
  validateTransactionInput,
  validateBudgetInput,
  validateMonthQuery,
  ALLOWED_CATEGORIES,
  ALLOWED_EXPENSE_CATEGORIES,
  ALLOWED_PAYMENT_METHODS,
  ALLOWED_TRANSACTION_TYPES,
} from '../backend/src/helpers/validation.mjs';

describe('QA Check 14 — Robust Input Validation & Malformed Payloads', () => {
  it('strictly validates the 9 mandated categories', () => {
    const requiredCategories = [
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

    assert.equal(ALLOWED_CATEGORIES.length, 9);
    requiredCategories.forEach((cat) => {
      assert.ok(ALLOWED_CATEGORIES.includes(cat), `Missing required category: ${cat}`);
    });
  });

  it('strictly enforces the allowed payment methods', () => {
    const requiredMethods = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking', 'Other'];
    requiredMethods.forEach((method) => {
      assert.ok(ALLOWED_PAYMENT_METHODS.includes(method), `Missing payment method: ${method}`);
    });
  });

  it('rejects empty, null, or whitespace-only descriptions', () => {
    const tx = {
      description: '   ',
      amount: 100,
      type: 'EXPENSE',
      category: 'Food',
      transactionDate: '2026-10-15',
      paymentMethod: 'UPI',
    };

    const res = validateTransactionInput(tx);
    assert.equal(res.valid, false);
    assert.ok(res.errors.description);
  });

  it('rejects descriptions exceeding 200 characters', () => {
    const tx = {
      description: 'A'.repeat(201),
      amount: 100,
      type: 'EXPENSE',
      category: 'Food',
      transactionDate: '2026-10-15',
      paymentMethod: 'UPI',
    };

    const res = validateTransactionInput(tx);
    assert.equal(res.valid, false);
    assert.ok(res.errors.description);
  });

  it('rejects invalid or malformed ISO dates', () => {
    const invalidDates = [
      '2026-13-01', // Invalid month
      '2026-02-31', // Invalid day
      '15-10-2026', // Wrong order
      '2026/10/15', // Slashes instead of dashes
      '2026-10',    // Incomplete date
      'yesterday',  // Natural language
      '1730000000', // Timestamp
    ];

    invalidDates.forEach((date) => {
      const tx = {
        description: 'Test',
        amount: 100,
        type: 'EXPENSE',
        category: 'Food',
        transactionDate: date,
        paymentMethod: 'UPI',
      };
      const res = validateTransactionInput(tx);
      assert.equal(res.valid, false, `Date "${date}" should be rejected`);
      assert.ok(res.errors.transactionDate);
    });
  });

  it('rejects non-numeric, NaN, Infinity, negative and 3+ decimal amounts', () => {
    assert.equal(validateAmount(NaN).valid, false);
    assert.equal(validateAmount(Infinity).valid, false);
    assert.equal(validateAmount(-Infinity).valid, false);
    assert.equal(validateAmount(-150).valid, false);
    assert.equal(validateAmount(0).valid, false);
    assert.equal(validateAmount(10.123).valid, false);
    assert.equal(validateAmount('500').valid, false);
    assert.equal(validateAmount({}).valid, false);
    assert.equal(validateAmount(null).valid, false);
  });

  it('accepts valid 2-decimal monetary amounts', () => {
    assert.deepEqual(validateAmount(0.01), { valid: true, value: 0.01 });
    assert.deepEqual(validateAmount(500), { valid: true, value: 500 });
    assert.deepEqual(validateAmount(4999.99), { valid: true, value: 4999.99 });
  });

  it('validates budget inputs and requires OVERALL or expense category', () => {
    // Valid overall budget
    assert.equal(
      validateBudgetInput({ month: '2026-10', category: 'OVERALL', limitAmount: 15000 }).valid,
      true
    );

    // Valid category budget
    assert.equal(
      validateBudgetInput({ month: '2026-10', category: 'Food', limitAmount: 5000 }).valid,
      true
    );

    // Invalid budget category: 'Income' cannot be an expense budget limit
    assert.equal(
      validateBudgetInput({ month: '2026-10', category: 'Income', limitAmount: 5000 }).valid,
      false
    );

    // Invalid month format
    assert.equal(
      validateBudgetInput({ month: '2026-10-15', category: 'OVERALL', limitAmount: 5000 }).valid,
      false
    );
  });
});
