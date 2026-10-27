import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from '../src/helpers/response.mjs';
import { handleHealth } from '../src/handlers/health.mjs';

describe('API Gateway Response Helpers & HTTP Status Codes', () => {
  it('builds standard 200 success response with CORS headers', () => {
    const res = success({ message: 'OK' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Content-Type'], 'application/json');
    assert.ok(res.headers['Access-Control-Allow-Origin']);

    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.data.message, 'OK');
  });

  it('builds 201 created response', () => {
    const res = created({ id: 'tx-1' });
    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
  });

  it('builds 400 validation error response', () => {
    const res = badRequest('Invalid amount', { amount: 'Must be positive' });
    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.fieldErrors.amount);
  });

  it('builds 401 unauthorized response', () => {
    const res = unauthorized('Token missing');
    assert.equal(res.statusCode, 401);
    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  it('builds 403 forbidden response', () => {
    const res = forbidden('Access denied');
    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  it('builds 404 not found response', () => {
    const res = notFound('Transaction not found');
    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('builds 409 conflict response', () => {
    const res = conflict('Budget already exists for this category');
    assert.equal(res.statusCode, 409);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'CONFLICT');
  });

  it('sanitizes 500 server error and never leaks stack traces', () => {
    const sensitiveError = new Error('Database connection failed password=supersecret');
    const res = serverError(sensitiveError, 'req-98765');
    assert.equal(res.statusCode, 500);

    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.equal(body.error.requestId, 'req-98765');

    // Asserts no internal details leaked
    assert.ok(!res.body.includes('supersecret'));
    assert.ok(!res.body.includes('stack'));
  });

  it('returns healthy status from handleHealth', async () => {
    const res = await handleHealth();
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'healthy');
    assert.equal(body.data.service, 'spendwise-api');
  });
});
