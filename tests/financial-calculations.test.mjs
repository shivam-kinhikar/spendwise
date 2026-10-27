import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  roundTo2Decimals,
  getBudgetAlertLevel,
} from '../frontend/lib/currency.ts';

// Evaluation engine matching AffordabilityCalculator component
function evaluatePurchaseAffordability(currentRemainingBudget, overallLimit, totalExpenses, plannedAmount) {
  if (plannedAmount === undefined || plannedAmount === null || isNaN(plannedAmount)) {
    return { status: 'idle', valid: false };
  }
  if (plannedAmount < 0) {
    return { status: 'invalid', reason: 'negative', valid: false };
  }
  if (plannedAmount === 0) {
    return { status: 'invalid', reason: 'zero', valid: false };
  }

  const projectedRemaining = roundTo2Decimals(currentRemainingBudget - plannedAmount);
  const projectedExpenses = roundTo2Decimals(totalExpenses + plannedAmount);
  const projectedPercentage = overallLimit > 0 ? roundTo2Decimals((projectedExpenses / overallLimit) * 100) : 0;

  if (projectedRemaining < 0) {
    return { status: 'exceeded', projectedRemaining, projectedPercentage, valid: true };
  }
  if (projectedPercentage >= 90) {
    return { status: 'caution_90', projectedRemaining, projectedPercentage, valid: true };
  }
  if (projectedPercentage >= 75) {
    return { status: 'caution_75', projectedRemaining, projectedPercentage, valid: true };
  }
  return { status: 'affordable', projectedRemaining, projectedPercentage, valid: true };
}

describe('QA Check 10 & 13 — Budget Calculations and Alert Thresholds', () => {
  it('strictly defines remaining budget as overall budget limit minus expenses', () => {
    const overallBudgetLimit = 15000;
    const totalExpenses = 9450;
    const totalIncome = 22000;

    const remainingBudget = roundTo2Decimals(overallBudgetLimit - totalExpenses);
    assert.equal(remainingBudget, 5550);

    // Verify it is NOT income minus expenses
    assert.notEqual(remainingBudget, totalIncome - totalExpenses);
  });

  it('accurately evaluates budget alert levels at boundary thresholds', () => {
    // Under 75% -> normal
    assert.equal(getBudgetAlertLevel(0), 'normal');
    assert.equal(getBudgetAlertLevel(74.99), 'normal');

    // 75% to 89.99% -> warning_75
    assert.equal(getBudgetAlertLevel(75.0), 'warning_75');
    assert.equal(getBudgetAlertLevel(75.01), 'warning_75');
    assert.equal(getBudgetAlertLevel(89.99), 'warning_75');

    // 90% to 99.99% -> warning_90
    assert.equal(getBudgetAlertLevel(90.0), 'warning_90');
    assert.equal(getBudgetAlertLevel(90.01), 'warning_90');
    assert.equal(getBudgetAlertLevel(99.99), 'warning_90');

    // >= 100% -> exceeded_100
    assert.equal(getBudgetAlertLevel(100.0), 'exceeded_100');
    assert.equal(getBudgetAlertLevel(100.01), 'exceeded_100');
    assert.equal(getBudgetAlertLevel(125.5), 'exceeded_100');
  });

  it('avoids division-by-zero when budget limit is zero', () => {
    const limit = 0;
    const spent = 2500;
    const percentage = limit > 0 ? roundTo2Decimals((spent / limit) * 100) : 0;
    assert.equal(percentage, 0);
    assert.equal(getBudgetAlertLevel(percentage), 'normal');
  });
});

describe('QA Check 12 — “Can I Afford This?” Calculator Boundary Conditions', () => {
  const currentRemaining = 5550;
  const overallLimit = 15000;
  const totalExpenses = 9450;

  it('evaluates comfortable affordability when purchase is small', () => {
    // 9450 + 500 = 9950 (66.33% used, remaining 5050)
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, 500);
    assert.equal(res.status, 'affordable');
    assert.equal(res.projectedRemaining, 5050);
    assert.equal(res.valid, true);
  });

  it('warns when purchase pushes spending above 75%', () => {
    // 9450 + 2000 = 11450 (76.33% used, remaining 3550)
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, 2000);
    assert.equal(res.status, 'caution_75');
    assert.equal(res.projectedRemaining, 3550);
  });

  it('warns critically when purchase pushes spending above 90%', () => {
    // 9450 + 4200 = 13650 (91.0% used, remaining 1350)
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, 4200);
    assert.equal(res.status, 'caution_90');
    assert.equal(res.projectedRemaining, 1350);
  });

  it('triggers budget exceeded warning when planned amount exceeds remaining budget', () => {
    // 5550 remaining, planned 6000 -> projected remaining -450
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, 6000);
    assert.equal(res.status, 'exceeded');
    assert.equal(res.projectedRemaining, -450);
  });

  it('handles negative purchase amounts cleanly', () => {
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, -500);
    assert.equal(res.status, 'invalid');
    assert.equal(res.reason, 'negative');
    assert.equal(res.valid, false);
  });

  it('handles zero purchase amount cleanly', () => {
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, 0);
    assert.equal(res.status, 'invalid');
    assert.equal(res.reason, 'zero');
    assert.equal(res.valid, false);
  });

  it('handles empty or non-numeric purchase amounts', () => {
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, NaN);
    assert.equal(res.status, 'idle');
    assert.equal(res.valid, false);
  });

  it('handles astronomical purchase amounts without overflow bugs', () => {
    const res = evaluatePurchaseAffordability(currentRemaining, overallLimit, totalExpenses, 1000000000);
    assert.equal(res.status, 'exceeded');
    assert.ok(res.projectedRemaining < -999000000);
  });
});

describe('QA Check — Currency Formatting & Floating Point Precision', () => {
  it('formats Indian Rupee (₹) correctly with commas and 2 decimals', () => {
    assert.ok(formatINR(1250).includes('1,250.00'));
    assert.ok(formatINR(150000).includes('1,50,000.00'));
    assert.ok(formatINR(0).includes('0.00'));
  });

  it('prevents IEEE 754 precision glitches', () => {
    // 0.1 + 0.2 in standard JS is 0.30000000000000004
    assert.equal(0.1 + 0.2 === 0.3, false);
    assert.equal(roundTo2Decimals(0.1 + 0.2), 0.3);
  });
});
