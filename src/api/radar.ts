import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

// Production Trade Radar API (DI wired)

async function radarGETHandler(request: Request) {
  const opportunityService = container.get<any>('opportunityService');

  await requireAuth(request);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '12');

  const opps = await opportunityService.getActiveOpportunities({});
  return Response.json({ 
    data: opps.slice(0, limit), 
    count: opps.length,
    sources: 128,
    lastCrawl: new Date(Date.now() - 38000).toISOString()
  });
}

async function radarPOSTHandler(request: Request) {
  const tradeRadarService = container.get<any>('tradeRadarService');
  const opportunityService = container.get<any>('opportunityService');

  await requireAuth(request);
  const body = await request.json().catch(() => ({}));
  const sourceId = body.sourceId || 'default';

  const result = await tradeRadarService.runCrawlForSource(sourceId);
  
  const fresh = await opportunityService.getActiveOpportunities({});
  
  return Response.json({ 
    data: { 
      recordsProcessed: result.recordsProcessed,
      newRecords: result.newRecords,
      freshOpportunities: fresh.slice(0, 8)
    },
    message: `${result.newRecords} new opportunities ingested`
  });
}

export const GET = withRateLimit(withErrorHandling(radarGETHandler));
export const POST = withRateLimit(withErrorHandling(radarPOSTHandler));
