import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function round(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function computeRemainingBudget(overallLimit, totalExpenses) {
  return round(overallLimit - totalExpenses);
}

function computeBudgetPercentage(spent, limit) {
  if (limit <= 0) return 0;
  return round((spent / limit) * 100);
}

function getBudgetAlertLevel(percentage) {
  if (percentage >= 100) return 'exceeded_100';
  if (percentage >= 90) return 'warning_90';
  if (percentage >= 75) return 'warning_75';
  return 'normal';
}

function computeMomChange(currentExpenses, previousExpenses) {
  const diff = round(currentExpenses - previousExpenses);
  const pct = previousExpenses > 0 ? round((diff / previousExpenses) * 100) : 0;
  return { changeAmount: diff, changePercentage: pct };
}

describe('Financial Calculations — Budget Metrics & Thresholds', () => {
  it('strictly calculates remaining budget as limit minus expenses', () => {
    const limit = 15000;
    const expenses = 8649;
    const income = 22500;

    const remaining = computeRemainingBudget(limit, expenses);
    assert.equal(remaining, 6351);

    // Verify it is NOT income minus expenses
    assert.notEqual(remaining, income - expenses);
  });

  it('safely handles zero limit without division by zero', () => {
    const percentage = computeBudgetPercentage(500, 0);
    assert.equal(percentage, 0);
    assert.equal(getBudgetAlertLevel(percentage), 'normal');
  });

  it('correctly maps 75%, 90%, and 100% boundary thresholds', () => {
    // Normal (<75%)
    assert.equal(getBudgetAlertLevel(74.99), 'normal');
    assert.equal(getBudgetAlertLevel(50), 'normal');

    // Caution (75% to 89.99%)
    assert.equal(getBudgetAlertLevel(75.0), 'warning_75');
    assert.equal(getBudgetAlertLevel(85.5), 'warning_75');
    assert.equal(getBudgetAlertLevel(89.99), 'warning_75');

    // Warning (90% to 99.99%)
    assert.equal(getBudgetAlertLevel(90.0), 'warning_90');
    assert.equal(getBudgetAlertLevel(95.0), 'warning_90');
    assert.equal(getBudgetAlertLevel(99.99), 'warning_90');

    // Exceeded (>=100%)
    assert.equal(getBudgetAlertLevel(100.0), 'exceeded_100');
    assert.equal(getBudgetAlertLevel(105.2), 'exceeded_100');
  });

  it('accurately computes month-over-month delta amounts and percentages', () => {
    // Expense increase
    const increased = computeMomChange(10000, 8000);
    assert.equal(increased.changeAmount, 2000);
    assert.equal(increased.changePercentage, 25.0);

    // Expense decrease
    const decreased = computeMomChange(6000, 8000);
    assert.equal(decreased.changeAmount, -2000);
    assert.equal(decreased.changePercentage, -25.0);

    // Zero previous month
    const zeroPrev = computeMomChange(5000, 0);
    assert.equal(zeroPrev.changeAmount, 5000);
    assert.equal(zeroPrev.changePercentage, 0);
  });
});
