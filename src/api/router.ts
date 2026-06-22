/**
 * Production API Router
 * All business logic goes through here — never in components.
 * Uses DI for observability where needed.
 */
import { container } from '../lib/di';
import { GET as opportunitiesGET, POST as opportunitiesPOST } from './opportunities';
import { GET as userGET, POST as userPOST } from './user';
import { GET as preDealsGET, POST as preDealsPOST } from './pre-deals';
import { GET as radarGET, POST as radarPOST } from './radar';
import { GET as normalizationGET, POST as normalizationPOST } from './normalization';
import { GET as marketGET, POST as marketPOST } from './market';
import { GET as creditsGET, POST as creditsPOST } from './credits';
import { GET as healthGET } from './health';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { logger } from '../lib/logger';
import { getConfig } from '../lib/config';

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');

  // Health (no rate limit, simple)
  if (path === '/health') {
    return await healthGET();
  }

  // Opportunities
  if (path === '/opportunities' || path === '/opportunities/') {
    const handler = request.method === 'GET' ? opportunitiesGET : opportunitiesPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  // User
  if (path === '/user/me' || path === '/user') {
    const handler = request.method === 'GET' ? userGET : userPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  // Credits
  if (path === '/credits' || path === '/credits/balance') {
    const handler = request.method === 'GET' ? creditsGET : creditsPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  // Pre-Deals
  if (path === '/pre-deals' || path === '/pre-deals/') {
    const handler = request.method === 'GET' ? preDealsGET : preDealsPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  // Radar
  if (path === '/radar' || path === '/radar/') {
    const handler = request.method === 'GET' ? radarGET : radarPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  // Normalization
  if (path === '/normalization' || path === '/normalization/') {
    const handler = request.method === 'GET' ? normalizationGET : normalizationPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  // Market
  if (path === '/market' || path === '/market/') {
    const handler = request.method === 'GET' ? marketGET : marketPOST;
    return await withRateLimit(withErrorHandling(handler))(request);
  }

  return Response.json({ error: 'Not Found' }, { status: 404 });
}
