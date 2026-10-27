import {
  success,
  created,
  noContent,
  badRequest,
  notFound,
} from '../helpers/response.mjs';
import { validateTransactionInput, validateAmount } from '../helpers/validation.mjs';
import {
  dbGetTransaction,
  dbCreateTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbQueryTransactions,
} from '../helpers/db.mjs';
import crypto from 'node:crypto';

/**
 * Remove DynamoDB partition/sort keys from customer-facing response
 */
function sanitizeTransaction(item) {
  if (!item) return null;
  const { PK, SK, GSI1PK, GSI1SK, ...clean } = item;
  return clean;
}

/**
 * GET /transactions
 */
export async function handleListTransactions(userId, queryParams = {}) {
  const result = await dbQueryTransactions(userId, {
    month: queryParams.month,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    category: queryParams.category,
    type: queryParams.type,
    limit: queryParams.limit,
    nextToken: queryParams.nextToken,
  });

  return success({
    transactions: result.items.map(sanitizeTransaction),
    nextToken: result.nextToken,
    count: result.items.length,
  });
}

/**
 * GET /transactions/{transactionId}
 */
export async function handleGetTransaction(userId, transactionId) {
  if (!transactionId) {
    return badRequest('Transaction ID is required');
  }

  const tx = await dbGetTransaction(userId, transactionId);
  if (!tx) {
    // Return 404 without leaking if the ID exists under another user
    return notFound('Transaction not found');
  }

  return success(sanitizeTransaction(tx));
}

/**
 * POST /transactions
 */
export async function handleCreateTransaction(userId, body) {
  if (!body || typeof body !== 'object') {
    return badRequest('Request body must be a JSON object');
  }

  const validation = validateTransactionInput(body, false);
  if (!validation.valid) {
    return badRequest('Validation failed', validation.errors);
  }

  const now = new Date().toISOString();
  const transactionId = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const amountRes = validateAmount(body.amount);

  const newRecord = {
    transactionId,
    description: body.description.trim(),
    amount: amountRes.value,
    type: body.type,
    category: body.category,
    transactionDate: body.transactionDate,
    paymentMethod: body.paymentMethod,
    notes: body.notes ? body.notes.trim() : undefined,
    receiptKey: body.receiptKey || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const createdItem = await dbCreateTransaction(userId, newRecord);
  return created(sanitizeTransaction(createdItem));
}

/**
 * PATCH /transactions/{transactionId}
 */
export async function handleUpdateTransaction(userId, transactionId, body) {
  if (!transactionId) {
    return badRequest('Transaction ID is required');
  }
  if (!body || typeof body !== 'object') {
    return badRequest('Request body must be a JSON object');
  }

  // Validate allowed update fields
  const allowedFields = [
    'description',
    'amount',
    'type',
    'category',
    'transactionDate',
    'paymentMethod',
    'notes',
    'receiptKey',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return badRequest('No valid update fields provided');
  }

  const validation = validateTransactionInput(updates, true);
  if (!validation.valid) {
    return badRequest('Validation failed', validation.errors);
  }

  if (updates.amount !== undefined) {
    const amountRes = validateAmount(updates.amount);
    updates.amount = amountRes.value;
  }
  if (updates.description !== undefined) {
    updates.description = updates.description.trim();
  }
  if (updates.notes !== undefined && typeof updates.notes === 'string') {
    updates.notes = updates.notes.trim();
  }

  try {
    const updated = await dbUpdateTransaction(userId, transactionId, updates);
    return success(sanitizeTransaction(updated));
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return notFound('Transaction not found');
    }
    throw err;
  }
}

/**
 * DELETE /transactions/{transactionId}
 */
export async function handleDeleteTransaction(userId, transactionId) {
  if (!transactionId) {
    return badRequest('Transaction ID is required');
  }

  try {
    await dbDeleteTransaction(userId, transactionId);
    return noContent();
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return notFound('Transaction not found');
    }
    throw err;
  }
}
