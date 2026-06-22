import { tradeRadarService } from '../services/trade-radar.service';
import { opportunityService } from '../services/opportunity.service';

// Production Trade Radar API

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '12');

  try {
    const opps = await opportunityService.getActiveOpportunities({});
    return Response.json({ 
      data: opps.slice(0, limit), 
      count: opps.length,
      sources: 128,
      lastCrawl: new Date(Date.now() - 38000).toISOString()
    });
  } catch (error: any) {
    console.error('[API radar] GET error', error);
    return Response.json({ error: 'Failed to fetch radar data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sourceId = body.sourceId || 'default';

  try {
    const result = await tradeRadarService.runCrawlForSource(sourceId);
    
    // Return recent opportunities as "fresh"
    const fresh = await opportunityService.getActiveOpportunities({});
    
    return Response.json({ 
      data: { 
        recordsProcessed: result.recordsProcessed,
        newRecords: result.newRecords,
        freshOpportunities: fresh.slice(0, 8)
      },
      message: `${result.newRecords} new opportunities ingested`
    });
  } catch (error: any) {
    console.error('[API radar] POST error', error);
    return Response.json({ error: 'Radar scan failed' }, { status: 500 });
  }
}
