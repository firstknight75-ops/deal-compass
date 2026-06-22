import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

// Production API for pre-deals (DI wired)

async function preDealsGETHandler(request: Request) {
  await requireAuth(request);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const { data, error } = await (await import('../lib/supabase/server')).supabaseAdmin
    .from('pre_deals')
    .select(`
      *,
      supply:products!supply_opportunity_id(*),
      demand:products!demand_opportunity_id(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const formatted = (data || []).map((pd: any) => ({
    id: pd.id,
    opportunityId: pd.supply_opportunity_id || pd.demand_opportunity_id,
    product: pd.supply?.product_name || pd.demand?.product_name,
    suggestedPrice: pd.suggested_price,
    quantity: pd.suggested_quantity,
    buyerId: pd.demand_opportunity_id,
    sellerId: pd.supply_opportunity_id,
    matchScore: pd.match_score,
    status: pd.status,
    expiresAt: pd.expires_at,
    paymentTerms: pd.payment_recommendation,
  }));

  return Response.json({ data: formatted, count: formatted.length });
}

async function preDealsPOSTHandler(request: Request) {
  const preDealService = container.get<any>('preDealService');
  const opportunityService = container.get<any>('opportunityService');

  const auth = await requireAuth(request);
  const body = await request.json();
  const { action, id, opportunityId } = body;

  if (action === 'generate') {
    const count = await preDealService.generatePreDeals();
    return Response.json({ data: { generated: count }, message: 'Pre-deals generated' });
  }

  if (action === 'respond' && id) {
    const updated = await preDealService.respondToPreDeal(id, auth.user.id, body.status);
    return Response.json({ data: updated });
  }

  if (action === 'create' && opportunityId) {
    const opp = await opportunityService.getOpportunityById(opportunityId);
    if (!opp) return Response.json({ error: 'Opportunity not found' }, { status: 404 });

    const { data: pd } = await (await import('../lib/supabase/server')).supabaseAdmin
      .from('pre_deals')
      .insert({
        supply_opportunity_id: opp.type === 'sell' ? opp.id : null,
        demand_opportunity_id: opp.type === 'buy' ? opp.id : null,
        suggested_price: Math.round((opp.price || 500) * 0.97),
        suggested_quantity: opp.quantity || 1000,
        match_score: 82,
        status: 'pending',
        payment_recommendation: 'LC at sight',
        expires_at: new Date(Date.now() + 1000 * 3600 * 72).toISOString(),
      })
      .select()
      .single();

    return Response.json({ data: pd }, { status: 201 });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

export const GET = withRateLimit(withErrorHandling(preDealsGETHandler));
export const POST = withRateLimit(withErrorHandling(preDealsPOSTHandler));
