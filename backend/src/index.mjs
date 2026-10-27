/**
 * SpendWise AWS Serverless Lambda Handler
 * Node.js 22 ES Module entry point for Amazon API Gateway HTTP API.
 */

import { buildResponse, badRequest, notFound, serverError, unauthorized } from './helpers/response.mjs';
import { getAuthenticatedUserId, AuthError } from './helpers/auth.mjs';
import { handleHealth } from './handlers/health.mjs';
import {
  handleListTransactions,
  handleGetTransaction,
  handleCreateTransaction,
  handleUpdateTransaction,
  handleDeleteTransaction,
} from './handlers/transactions.mjs';
import {
  handleListBudgets,
  handleCreateOrUpdateBudget,
  handleUpdateBudget,
  handleDeleteBudget,
} from './handlers/budgets.mjs';
import { handleGetAnalytics } from './handlers/analytics.mjs';
import { handlePresignUpload } from './handlers/uploads.mjs';

function parseBody(event) {
  if (!event.body) return null;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw new Error('Malformed JSON request body');
  }
}

export async function handler(event, context) {
  const requestId = event?.requestContext?.requestId || context?.awsRequestId || 'unknown';
  const method = event?.requestContext?.http?.method || event?.httpMethod;
  const path = event?.rawPath || event?.path;
  const queryParams = event?.queryStringParameters || {};

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return buildResponse(204, '');
  }

  try {
    // 1. Public Endpoints
    if (path === '/health' && method === 'GET') {
      return await handleHealth();
    }

    // 2. Require Authenticated User Identity for all protected routes
    let userId;
    try {
      userId = getAuthenticatedUserId(event);
    } catch (authErr) {
      if (authErr instanceof AuthError) {
        return unauthorized(authErr.message);
      }
      return unauthorized('Authentication required');
    }

    // Parse JSON body if present
    let body = null;
    try {
      body = parseBody(event);
    } catch (parseErr) {
      return badRequest(parseErr.message);
    }

    // 3. Transactions Router
    if (path === '/transactions') {
      if (method === 'GET') {
        return await handleListTransactions(userId, queryParams);
      }
      if (method === 'POST') {
        return await handleCreateTransaction(userId, body);
      }
    }

    const txMatch = path.match(/^\/transactions\/([^/]+)$/);
    if (txMatch) {
      const transactionId = txMatch[1];
      if (method === 'GET') {
        return await handleGetTransaction(userId, transactionId);
      }
      if (method === 'PATCH') {
        return await handleUpdateTransaction(userId, transactionId, body);
      }
      if (method === 'DELETE') {
        return await handleDeleteTransaction(userId, transactionId);
      }
    }

    // 4. Budgets Router
    if (path === '/budgets') {
      if (method === 'GET') {
        return await handleListBudgets(userId, queryParams);
      }
      if (method === 'POST') {
        return await handleCreateOrUpdateBudget(userId, body);
      }
    }

    const budgetMatch = path.match(/^\/budgets\/([^/]+)$/);
    if (budgetMatch) {
      const budgetId = budgetMatch[1];
      if (method === 'PATCH') {
        return await handleUpdateBudget(userId, budgetId, body);
      }
      if (method === 'DELETE') {
        return await handleDeleteBudget(userId, budgetId);
      }
    }

    // 5. Analytics Router
    if (path === '/analytics/summary' && method === 'GET') {
      return await handleGetAnalytics(userId, queryParams);
    }

    // 6. S3 Presigned Uploads Router
    if (path === '/uploads/presign' && method === 'POST') {
      return await handlePresignUpload(userId, body);
    }

    // Route not found
    return notFound(`Endpoint ${method} ${path} does not exist`);
  } catch (err) {
    return serverError(err, requestId);
  }
}
