import { success, badRequest } from '../helpers/response.mjs';
import { validateMonthQuery } from '../helpers/validation.mjs';
import { dbQueryTransactions, dbGetBudgetsForMonth } from '../helpers/db.mjs';

function round(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function getAlertLevel(percentage) {
  if (percentage >= 100) return 'exceeded_100';
  if (percentage >= 90) return 'warning_90';
  if (percentage >= 75) return 'warning_75';
  return 'normal';
}

function getPreviousMonthString(targetMonth) {
  const [yearStr, monthStr] = targetMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const prevDate = new Date(Date.UTC(year, month - 2, 1));
  return `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * GET /analytics/summary?month=YYYY-MM
 */
export async function handleGetAnalytics(userId, queryParams = {}) {
  const monthValidation = validateMonthQuery(queryParams.month);
  if (!monthValidation.valid) {
    return badRequest(monthValidation.error);
  }

  const currentMonth = monthValidation.value;
  const previousMonth = getPreviousMonthString(currentMonth);

  // Parallel fetch: current month transactions, previous month transactions, and budgets
  const [currentTxsRes, prevTxsRes, budgets] = await Promise.all([
    dbQueryTransactions(userId, { month: currentMonth, limit: 100 }),
    dbQueryTransactions(userId, { month: previousMonth, limit: 100 }),
    dbGetBudgetsForMonth(userId, currentMonth),
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryMap = {};

  currentTxsRes.items.forEach((tx) => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (!categoryMap[tx.category]) {
        categoryMap[tx.category] = { amount: 0, count: 0 };
      }
      categoryMap[tx.category].amount += tx.amount;
      categoryMap[tx.category].count += 1;
    }
  });

  totalIncome = round(totalIncome);
  totalExpenses = round(totalExpenses);
  const netSavings = round(totalIncome - totalExpenses);

  // Overall budget
  const overallBudget = budgets.find((b) => b.category === 'OVERALL');
  const overallBudgetLimit = overallBudget ? overallBudget.limitAmount : 0;

  // STRICT DEFINITION PER SPEC:
  // "remaining budget means overall budget limit minus expenses, not income minus expenses"
  const remainingBudget = round(overallBudgetLimit - totalExpenses);

  const overallBudgetPercentage =
    overallBudgetLimit > 0 ? round((totalExpenses / overallBudgetLimit) * 100) : 0;

  const budgetAlertLevel = getAlertLevel(overallBudgetPercentage);

  // Category breakdown
  const categorySpending = Object.entries(categoryMap)
    .map(([cat, data]) => ({
      category: cat,
      amount: round(data.amount),
      percentage: totalExpenses > 0 ? round((data.amount / totalExpenses) * 100) : 0,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Previous month total expenses
  const previousTotalExpenses = round(
    prevTxsRes.items
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  const expenseChangeAmount = round(totalExpenses - previousTotalExpenses);
  const expenseChangePercentage =
    previousTotalExpenses > 0
      ? round(((totalExpenses - previousTotalExpenses) / previousTotalExpenses) * 100)
      : 0;

  return success({
    month: currentMonth,
    totalIncome,
    totalExpenses,
    netSavings,
    overallBudgetLimit,
    remainingBudget,
    overallBudgetPercentage,
    budgetAlertLevel,
    categorySpending,
    previousMonthComparison: {
      previousMonth,
      previousTotalExpenses,
      expenseChangeAmount,
      expenseChangePercentage,
    },
  });
}
