import { createServerSupabaseClient } from '../lib/supabase/server';
import { opportunityService } from '../services/opportunity.service';
import { creditsService } from '../services/credits.service';
import { authorizationService } from '../services/authorization.service';

// Production API handlers for opportunities

export async function GET(request: Request) {
  const url = new URL(request.url);
  const product = url.searchParams.get('product') || undefined;
  const origin = url.searchParams.get('origin') || undefined;
  const type = url.searchParams.get('type') || undefined;
  const minScore = url.searchParams.get('minScore') ? parseInt(url.searchParams.get('minScore')!) : undefined;

  try {
    const opportunities = await opportunityService.getActiveOpportunities({
      product,
      origin,
      type,
      minScore,
    });

    return Response.json({ data: opportunities, count: opportunities.length });
  } catch (error) {
    console.error('[API] opportunities GET error', error);
    return Response.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Require credits for creating paid listings (example)
    const canSpend = await creditsService.spendCredits({
      userId: user.id,
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
  } catch (error) {
    return Response.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
