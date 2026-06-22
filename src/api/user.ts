import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

// Production API for user (DI wired)

async function userGETHandler(request: Request) {
  const userService = container.get<any>('userService');

  const auth = await requireAuth(request);
  const profile = await userService.getUserById(auth.user.id);

  if (!profile) {
    return Response.json({ 
      data: { 
        id: auth.user.id, 
        email: auth.user.email || 'unknown',
        full_name: auth.user.full_name || 'User',
        country: auth.user.country || 'Iraq',
        role: auth.user.role || 'user',
        account_tier: auth.user.account_tier || 'silver',
        credits_balance: auth.user.credits_balance || 0,
        kyc_status: auth.user.kyc_status || 'pending'
      } 
    });
  }

  return Response.json({ data: profile });
}

async function userPOSTHandler(request: Request) {
  const userService = container.get<any>('userService');

  const auth = await requireAuth(request);
  const body = await request.json();
  const updated = await userService.updateUser(auth.user.id, body);
  return Response.json({ data: updated });
}

export const GET = withRateLimit(withErrorHandling(userGETHandler), { max: 60 });
export const POST = withRateLimit(withErrorHandling(userPOSTHandler), { max: 20 });
