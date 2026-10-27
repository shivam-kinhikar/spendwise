import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAuthenticatedUserId, AuthError } from '../src/helpers/auth.mjs';

describe('Security & Authorization Helpers', () => {
  it('correctly extracts userId from valid Cognito JWT claims', () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: 'cognito-user-uuid-12345',
              email: 'student@university.edu.in',
            },
          },
        },
      },
    };

    const userId = getAuthenticatedUserId(event);
    assert.equal(userId, 'cognito-user-uuid-12345');
  });

  it('rejects event with missing authorizer claims', () => {
    const unauthenticatedEvent = {
      requestContext: {},
      queryStringParameters: {
        userId: 'malicious-attacker-user-id',
      },
      body: JSON.stringify({
        userId: 'malicious-attacker-user-id',
      }),
    };

    assert.throws(
      () => getAuthenticatedUserId(unauthenticatedEvent),
      (err) => err instanceof AuthError
    );
  });

  it('never falls back to user-supplied userId in query or body', () => {
    const spoofAttemptEvent = {
      queryStringParameters: { userId: 'victim-student-id' },
      body: JSON.stringify({ userId: 'victim-student-id' }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: 'actual-verified-caller-id',
            },
          },
        },
      },
    };

    const derivedUserId = getAuthenticatedUserId(spoofAttemptEvent);
    assert.equal(derivedUserId, 'actual-verified-caller-id');
    assert.notEqual(derivedUserId, 'victim-student-id');
  });

  it('rejects empty or whitespace sub claim', () => {
    const emptySubEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: '   ',
            },
          },
        },
      },
    };

    assert.throws(
      () => getAuthenticatedUserId(emptySubEvent),
      (err) => err instanceof AuthError
    );
  });
});
