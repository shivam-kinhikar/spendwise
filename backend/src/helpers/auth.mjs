/**
 * Authentication and authorization identity extractor.
 * Strictly derives the verified user identity from Amazon Cognito JWT claims
 * injected by API Gateway HTTP API Authorizer.
 */

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

/**
 * Extracts and verifies the user ID from the event requestContext.
 * Rejects any client-supplied userId.
 *
 * @param {object} event - API Gateway HTTP API v2 event
 * @returns {string} The verified Cognito user ID (sub claim)
 */
export function getAuthenticatedUserId(event) {
  // Check API Gateway HTTP API JWT authorizer claims
  const jwtClaims = event?.requestContext?.authorizer?.jwt?.claims;

  if (!jwtClaims) {
    throw new AuthError('Missing authentication claims. Ensure JWT authorizer is configured.');
  }

  const userId = jwtClaims.sub;

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new AuthError('Invalid or missing "sub" in authentication token claims.');
  }

  return userId.trim();
}

/**
 * Extracts optional caller metadata for safe audit logging (e.g. email)
 */
export function getAuthenticatedUserEmail(event) {
  return event?.requestContext?.authorizer?.jwt?.claims?.email || null;
}
