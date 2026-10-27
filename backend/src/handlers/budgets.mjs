import {
  success,
  created,
  noContent,
  badRequest,
  notFound,
} from '../helpers/response.mjs';
import { validateBudgetInput, validateMonthQuery, validateAmount } from '../helpers/validation.mjs';
import {
  dbGetBudgetsForMonth,
  dbGetBudget,
  dbSaveBudget,
  dbDeleteBudget,
} from '../helpers/db.mjs';

function sanitizeBudget(item) {
  if (!item) return null;
  const { PK, SK, ...clean } = item;
  return clean;
}

/**
 * Helper to parse a budgetId into month and category
 * Supports formats: "2026-10_OVERALL" or "bdg_2026-10_food"
 */
function parseBudgetId(budgetId) {
  if (!budgetId) return null;
  const cleanId = budgetId.startsWith('bdg_') ? budgetId.replace('bdg_', '') : budgetId;
  const parts = cleanId.split('_');
  if (parts.length >= 2) {
    const month = parts[0];
    const category = parts.slice(1).join('_');
    return { month, category };
  }
  return null;
}

/**
 * GET /budgets?month=YYYY-MM
 */
export async function handleListBudgets(userId, queryParams = {}) {
  const monthValidation = validateMonthQuery(queryParams.month);
  if (!monthValidation.valid) {
    return badRequest(monthValidation.error);
  }

  const items = await dbGetBudgetsForMonth(userId, monthValidation.value);
  return success({
    month: monthValidation.value,
    budgets: items.map(sanitizeBudget),
    count: items.length,
  });
}

/**
 * POST /budgets
 */
export async function handleCreateOrUpdateBudget(userId, body) {
  if (!body || typeof body !== 'object') {
    return badRequest('Request body must be a JSON object');
  }

  const validation = validateBudgetInput(body, false);
  if (!validation.valid) {
    return badRequest('Validation failed', validation.errors);
  }

  const amountRes = validateAmount(body.limitAmount);
  const now = new Date().toISOString();
  const budgetId = `bdg_${body.month}_${body.category.toLowerCase()}`;

  const existing = await dbGetBudget(userId, body.month, body.category);
  const budgetRecord = {
    budgetId,
    month: body.month,
    category: body.category,
    limitAmount: amountRes.value,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  const saved = await dbSaveBudget(userId, budgetRecord);
  return created(sanitizeBudget(saved));
}

/**
 * PATCH /budgets/{budgetId}
 */
export async function handleUpdateBudget(userId, budgetId, body) {
  const parsed = parseBudgetId(budgetId);
  if (!parsed) {
    return badRequest('Invalid budget ID format. Expected format: bdg_YYYY-MM_category');
  }

  if (!body || typeof body !== 'object' || body.limitAmount === undefined) {
    return badRequest('Request body must specify limitAmount');
  }

  const amountRes = validateAmount(body.limitAmount);
  if (!amountRes.valid) {
    return badRequest(amountRes.error);
  }

  const existing = await dbGetBudget(userId, parsed.month, parsed.category);
  if (!existing) {
    return notFound('Budget not found');
  }

  const now = new Date().toISOString();
  const updated = {
    ...existing,
    limitAmount: amountRes.value,
    updatedAt: now,
  };

  const saved = await dbSaveBudget(userId, updated);
  return success(sanitizeBudget(saved));
}

/**
 * DELETE /budgets/{budgetId}
 */
export async function handleDeleteBudget(userId, budgetId) {
  const parsed = parseBudgetId(budgetId);
  if (!parsed) {
    return badRequest('Invalid budget ID format. Expected format: bdg_YYYY-MM_category');
  }

  try {
    await dbDeleteBudget(userId, parsed.month, parsed.category);
    return noContent();
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return notFound('Budget not found');
    }
    throw err;
  }
}
