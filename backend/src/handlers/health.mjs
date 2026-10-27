import { success } from '../helpers/response.mjs';

/**
 * GET /health
 * Public health check returning system status and current timestamp.
 */
export async function handleHealth() {
  return success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'spendwise-api',
    version: '1.0.0',
  });
}
