import { createServerSupabaseClient } from '../lib/supabase/server';
import { preDealService } from '../services/predeal.service';
import { opportunityService } from '../services/opportunity.service';

// Production API for pre-deals

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
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
  } catch (error: any) {
    console.error('[API pre-deals] GET error', error);
    return Response.json({ error: 'Failed to fetch pre-deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, id, opportunityId } = body;
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    if (action === 'generate') {
      // Generate new pre-deals for an opp or general
      const count = await preDealService.generatePreDeals();
      return Response.json({ data: { generated: count }, message: 'Pre-deals generated' });
    }

    if (action === 'respond' && id) {
      if (!accessToken) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const supabase = createServerSupabaseClient(accessToken);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const updated = await preDealService.respondToPreDeal(id, user.id, body.status);
      return Response.json({ data: updated });
    }

    if (action === 'create' && opportunityId) {
      // Manual create
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
  } catch (error: any) {
    console.error('[API pre-deals] POST error', error);
    return Response.json({ error: 'Failed to process pre-deal' }, { status: 500 });
  }
}
