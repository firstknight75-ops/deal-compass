import { createServerSupabaseClient } from '../lib/supabase/server';
import { userService } from '../services/user.service';
import { creditsService } from '../services/credits.service';

// Production API for user

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

    const profile = await userService.getUserById(user.id);
    if (!profile) {
      return Response.json({ 
        data: { 
          id: user.id, 
          email: user.email || 'unknown',
          full_name: user.user_metadata?.full_name || 'User',
          country: 'Iraq',
          role: 'user',
          account_tier: 'silver',
          credits_balance: 0,
          kyc_status: 'pending'
        } 
      });
    }

    return Response.json({ data: profile });
  } catch (error: any) {
    console.error('[API user] GET error', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

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

    const updated = await userService.updateUser(user.id, body);
    return Response.json({ data: updated });
  } catch (error: any) {
    console.error('[API user] POST error', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
