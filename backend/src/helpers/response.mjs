/**
 * Response helper providing consistent JSON envelopes, CORS headers,
 * and standard HTTP status code formats for AWS API Gateway HTTP API.
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

export function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function success(data, statusCode = 200) {
  return buildResponse(statusCode, {
    success: true,
    data,
  });
}

export function created(data) {
  return success(data, 201);
}

export function noContent() {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  };
}

export function badRequest(message = 'Invalid request', fieldErrors = null) {
  const errorObj = {
    message,
    code: 'VALIDATION_ERROR',
  };
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    errorObj.fieldErrors = fieldErrors;
  }
  return buildResponse(400, {
    success: false,
    error: errorObj,
  });
}

export function unauthorized(message = 'Authentication required') {
  return buildResponse(401, {
    success: false,
    error: {
      message,
      code: 'UNAUTHORIZED',
    },
  });
}

export function forbidden(message = 'Access forbidden') {
  return buildResponse(403, {
    success: false,
    error: {
      message,
      code: 'FORBIDDEN',
    },
  });
}

export function notFound(message = 'Resource not found') {
  return buildResponse(404, {
    success: false,
    error: {
      message,
      code: 'NOT_FOUND',
    },
  });
}

export function conflict(message = 'Resource already exists or conflict occurred') {
  return buildResponse(409, {
    success: false,
    error: {
      message,
      code: 'CONFLICT',
    },
  });
}

export function serverError(err, requestId = 'unknown') {
  // Safe server logging: Log error message without sensitive payload
  console.error(`[RequestId: ${requestId}] Internal Error:`, err?.message || err);

  return buildResponse(500, {
    success: false,
    error: {
      message: 'An unexpected internal error occurred. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      requestId,
    },
  });
}
