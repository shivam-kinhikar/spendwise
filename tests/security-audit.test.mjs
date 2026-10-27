import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getAuthenticatedUserId, AuthError } from '../backend/src/helpers/auth.mjs';
import { serverError, success } from '../backend/src/helpers/response.mjs';
import { generatePresignedUploadUrl } from '../backend/src/helpers/s3.mjs';

describe('Security Test 1 & 3 — Authentication Claims & Identity Derivation', () => {
  it('strictly derives caller userId from authorizer sub claim', () => {
    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: 'verified-cognito-uuid-999',
            },
          },
        },
      },
    };

    assert.equal(getAuthenticatedUserId(event), 'verified-cognito-uuid-999');
  });

  it('rejects unauthenticated requests without JWT claims', () => {
    const unauthenticatedEvent = {
      requestContext: {
        http: { method: 'GET', path: '/transactions' },
      },
    };

    assert.throws(
      () => getAuthenticatedUserId(unauthenticatedEvent),
      (err) => err instanceof AuthError
    );
  });

  it('rejects client-supplied userId spoofing attempts in body or query parameters', () => {
    const spoofEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: { sub: 'legitimate-student-uuid' },
          },
        },
      },
      queryStringParameters: { userId: 'victim-student-uuid' },
      body: JSON.stringify({ userId: 'victim-student-uuid', description: 'Attack' }),
    };

    // Derived identity must strictly be the legitimate user's sub
    const derivedUserId = getAuthenticatedUserId(spoofEvent);
    assert.equal(derivedUserId, 'legitimate-student-uuid');
    assert.notEqual(derivedUserId, 'victim-student-uuid');
  });
});

describe('Security Test 4 & 5 — Error Sanitization & CORS Header Security', () => {
  it('never leaks database connection strings, passwords, or stack traces in 500 responses', () => {
    const internalErr = new Error('FATAL: connection to DynamoDB timed out with SecretAccessKey=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
    const response = serverError(internalErr, 'test-req-001');

    assert.equal(response.statusCode, 500);
    const body = JSON.parse(response.body);

    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.equal(body.error.requestId, 'test-req-001');

    // Confirm that no sensitive leak occurred
    assert.ok(!response.body.includes('SecretAccessKey'));
    assert.ok(!response.body.includes('DynamoDB timed out'));
    assert.ok(!response.body.includes('FATAL'));
    assert.ok(!response.body.includes('stack'));
  });

  it('includes proper CORS headers in all standard responses', () => {
    const res = success({ test: true });
    assert.ok(res.headers['Access-Control-Allow-Origin']);
    assert.ok(res.headers['Access-Control-Allow-Headers']);
    assert.ok(res.headers['Access-Control-Allow-Methods']);
  });
});

describe('Security Test 6 — S3 Presigned URL Scoping & Content Restrictions', () => {
  it('scopes upload object key strictly to the authenticated user ID prefix', async () => {
    const userId = 'student-uuid-456';
    const result = await generatePresignedUploadUrl(userId, {
      transactionId: 'tx-test',
      fileName: 'receipt.png',
      contentType: 'image/png',
    });

    assert.ok(result.objectKey.startsWith(`receipts/${userId}/`));
    assert.equal(result.expiresInSeconds, 300); // 5-minute expiry
  });

  it('rejects unsupported or dangerous executable MIME types', async () => {
    const userId = 'student-uuid-456';
    await assert.rejects(
      async () => {
        await generatePresignedUploadUrl(userId, {
          transactionId: 'tx-test',
          fileName: 'exploit.sh',
          contentType: 'application/x-sh',
        });
      },
      (err) => err.message.includes('Unsupported content-type')
    );
  });
});

describe('Security Test 7 — Repository Hygiene & Credential Audit', () => {
  it('verifies that no real .env or AWS secret files are present', () => {
    const rootDir = path.resolve('.');
    const forbiddenFiles = ['.env', '.env.local', '.env.production', '.env.staging'];

    forbiddenFiles.forEach((file) => {
      const filePath = path.join(rootDir, file);
      assert.equal(fs.existsSync(filePath), false, `Forbidden file ${file} exists in root!`);
    });

    const frontendFilePath = path.join(rootDir, 'frontend', '.env.local');
    assert.equal(fs.existsSync(frontendFilePath), false, 'Forbidden .env.local found in frontend!');
  });

  it('verifies .gitignore properly ignores sensitive environment files', () => {
    const rootDir = path.resolve('.');
    const gitignorePath = path.join(rootDir, '.gitignore');
    assert.ok(fs.existsSync(gitignorePath), '.gitignore must exist');

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    assert.ok(content.includes('.env*'));
    assert.ok(content.includes('!.env.example'));
  });
});
