import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

// Production API handlers for opportunities (DI wired - no direct service imports)

async function opportunitiesGETHandler(request: Request) {
  const opportunityService = container.get<any>('opportunityService');

  await requireAuth(request);
  const url = new URL(request.url);
  const product = url.searchParams.get('product') || undefined;
  const origin = url.searchParams.get('origin') || undefined;
  const type = url.searchParams.get('type') || undefined;
  const minScore = url.searchParams.get('minScore') ? parseInt(url.searchParams.get('minScore')!) : undefined;

  const opportunities = await opportunityService.getActiveOpportunities({
    product,
    origin,
    type,
    minScore,
  });

  return Response.json({ data: opportunities, count: opportunities.length });
}

async function opportunitiesPOSTHandler(request: Request) {
  const creditsService = container.get<any>('creditsService');
  const opportunityService = container.get<any>('opportunityService');

  const auth = await requireAuth(request);
  const body = await request.json();

  // Require credits for creating paid listings
  const canSpend = await creditsService.spendCredits({
    userId: auth.user.id,
    amount: 2,
    referenceId: 'create_opportunity',
  });

  if (!canSpend) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  const opp = await opportunityService.createOpportunity({
    ...body,
    company_name: body.company_name || 'User Listing',
  });

  return Response.json({ data: opp }, { status: 201 });
}

export const GET = withRateLimit(withErrorHandling(opportunitiesGETHandler));
export const POST = withRateLimit(withErrorHandling(opportunitiesPOSTHandler));
