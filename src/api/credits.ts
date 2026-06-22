import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

// Production Credits API (DI wired)

async function creditsGETHandler(request: Request) {
  const creditsService = container.get<any>('creditsService');

  const auth = await requireAuth(request);
  const balance = await creditsService.getBalance(auth.user.id);
  return Response.json({ data: { balance, tier: auth.user.account_tier || 'silver' } });
}

async function creditsPOSTHandler(request: Request) {
  const creditsService = container.get<any>('creditsService');

  const auth = await requireAuth(request);
  const body = await request.json();
  const { amount, referenceId, metadata } = body;

  const success = await creditsService.spendCredits({
    userId: auth.user.id,
    amount: amount || 1,
    referenceId: referenceId || 'unlock',
    metadata: metadata || {},
  });

  if (!success) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  const newBalance = await creditsService.getBalance(auth.user.id);
  return Response.json({ success: true, newBalance });
}

export const GET = withRateLimit(withErrorHandling(creditsGETHandler), { max: 120 });
export const POST = withRateLimit(withErrorHandling(creditsPOSTHandler), { max: 30 });
