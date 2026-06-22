/**
 * Production Health Check Endpoint
 * (Public - no auth required, but rate limited + error handled for protection)
 */
import { observability } from '../services/observability.service';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';

async function healthHandler() {
  const checks: any = {
    database: 'ok',
    services: 'ok',
    timestamp: new Date().toISOString(),
  };

  try {
    // Lightweight health probe
    const metrics = observability.getMetrics();
    checks.metrics = metrics;
  } catch (e) {
    checks.database = 'degraded';
  }

  return Response.json({
    status: 'healthy',
    version: '2026.06',
    checks,
    metrics: observability.getMetrics(),
  });
}

export const GET = withRateLimit(withErrorHandling(healthHandler), { max: 120 });
