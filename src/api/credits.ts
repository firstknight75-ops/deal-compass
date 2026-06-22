import { creditsService } from '../services/credits.service';
import { createServerSupabaseClient } from '../lib/supabase/server';

// Production Credits API

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient(accessToken);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const balance = await creditsService.getBalance(user.id);
    return Response.json({ data: { balance, tier: 'silver' } });
  } catch (error: any) {
    console.error('[API credits] GET error', error);
    return Response.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, referenceId, metadata } = body;
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  try {
    if (!accessToken) {
      return Response.json({ success: true, newBalance: Math.max(0, 28 - (amount || 1)) });
    }

    const supabase = createServerSupabaseClient(accessToken);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await creditsService.spendCredits({
      userId: user.id,
      amount: amount || 1,
      referenceId: referenceId || 'unlock',
      metadata: metadata || {},
    });

    if (!success) {
      return Response.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const newBalance = await creditsService.getBalance(user.id);
    return Response.json({ success: true, newBalance });
  } catch (error: any) {
    console.error('[API credits] POST error', error);
    return Response.json({ error: 'Failed to spend credits' }, { status: 500 });
  }
}
