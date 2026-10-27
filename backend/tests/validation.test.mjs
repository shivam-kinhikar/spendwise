import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAmount,
  validateTransactionInput,
  validateBudgetInput,
  validateMonthQuery,
  ALLOWED_CATEGORIES,
} from '../src/helpers/validation.mjs';

describe('Validation Helpers — Monetary Amounts', () => {
  it('accepts valid positive numbers with up to 2 decimals', () => {
    assert.deepEqual(validateAmount(100), { valid: true, value: 100 });
    assert.deepEqual(validateAmount(250.5), { valid: true, value: 250.5 });
    assert.deepEqual(validateAmount(1234.99), { valid: true, value: 1234.99 });
  });

  it('rejects zero or negative amounts', () => {
    assert.equal(validateAmount(0).valid, false);
    assert.equal(validateAmount(-50).valid, false);
    assert.equal(validateAmount(-0.01).valid, false);
  });

  it('rejects NaN, Infinity, and non-numeric inputs', () => {
    assert.equal(validateAmount(NaN).valid, false);
    assert.equal(validateAmount(Infinity).valid, false);
    assert.equal(validateAmount(-Infinity).valid, false);
    assert.equal(validateAmount('100').valid, false);
    assert.equal(validateAmount(null).valid, false);
    assert.equal(validateAmount(undefined).valid, false);
  });

  it('rejects amounts exceeding 2 decimal places', () => {
    assert.equal(validateAmount(10.123).valid, false);
    assert.equal(validateAmount(99.999).valid, false);
  });
});

describe('Validation Helpers — Transactions', () => {
  const validTx = {
    description: 'Canteen Lunch',
    amount: 150.0,
    type: 'EXPENSE',
    category: 'Food',
    transactionDate: '2026-10-15',
    paymentMethod: 'UPI',
    notes: 'Campus meal',
  };

  it('passes for a fully valid transaction payload', () => {
    const res = validateTransactionInput(validTx);
    assert.equal(res.valid, true);
    assert.deepEqual(res.errors, {});
  });

  it('rejects empty or whitespace-only description', () => {
    const res = validateTransactionInput({ ...validTx, description: '   ' });
    assert.equal(res.valid, false);
    assert.ok(res.errors.description);
  });

  it('rejects invalid transaction type', () => {
    const res = validateTransactionInput({ ...validTx, type: 'INVESTMENT' });
    assert.equal(res.valid, false);
    assert.ok(res.errors.type);
  });

  it('rejects invalid category', () => {
    const res = validateTransactionInput({ ...validTx, category: 'Cryptocurrency' });
    assert.equal(res.valid, false);
    assert.ok(res.errors.category);
  });

  it('rejects malformed dates and invalid calendar dates', () => {
    assert.equal(validateTransactionInput({ ...validTx, transactionDate: '15-10-2026' }).valid, false);
    assert.equal(validateTransactionInput({ ...validTx, transactionDate: '2026/10/15' }).valid, false);
    assert.equal(validateTransactionInput({ ...validTx, transactionDate: 'not-a-date' }).valid, false);
  });

  it('rejects invalid payment method', () => {
    const res = validateTransactionInput({ ...validTx, paymentMethod: 'Bitcoin' });
    assert.equal(res.valid, false);
    assert.ok(res.errors.paymentMethod);
  });
});

describe('Validation Helpers — Budgets', () => {
  it('validates overall monthly budget', () => {
    const res = validateBudgetInput({
      month: '2026-10',
      category: 'OVERALL',
      limitAmount: 15000,
    });
    assert.equal(res.valid, true);
  });

  it('validates category budget for Food', () => {
    const res = validateBudgetInput({
      month: '2026-10',
      category: 'Food',
      limitAmount: 5000,
    });
    assert.equal(res.valid, true);
  });

  it('rejects invalid budget month format', () => {
    const res = validateBudgetInput({
      month: 'October-2026',
      category: 'OVERALL',
      limitAmount: 5000,
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.month);
  });

  it('rejects negative or zero budget limit', () => {
    const res = validateBudgetInput({
      month: '2026-10',
      category: 'OVERALL',
      limitAmount: 0,
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.limitAmount);
  });
});

describe('Validation Helpers — Month Query Parameter', () => {
  it('accepts valid YYYY-MM queries', () => {
    assert.equal(validateMonthQuery('2026-10').valid, true);
    assert.equal(validateMonthQuery('2026-01').valid, true);
  });

  it('rejects missing or invalid month queries', () => {
    assert.equal(validateMonthQuery(undefined).valid, false);
    assert.equal(validateMonthQuery('').valid, false);
    assert.equal(validateMonthQuery('2026-13').valid, false);
    assert.equal(validateMonthQuery('202610').valid, false);
  });
});
