/**
 * Billing API — Production Ready (DI wired)
 */
import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

async function billingGETHandler(request: Request) {
  const billingService = container.get<any>('billingService');
  const creditsService = container.get<any>('creditsService');

  const auth = await requireAuth(request);
  const plan = await billingService.getCurrentPlan(auth.user.id);
  const credits = await creditsService.getBalance(auth.user.id);

  return Response.json({
    tier: plan.tier,
    credits,
    tiers: require('../services/billing.service').TIERS,
  });
}

async function billingPOSTHandler(request: Request) {
  const billingService = container.get<any>('billingService');

  const auth = await requireAuth(request);
  const body = await request.json();
  const { action, tier, amount } = body;

  if (action === 'upgrade') {
    const result = await billingService.upgradeTier(auth.user.id, tier);
    return Response.json(result);
  }

  if (action === 'purchase_credits') {
    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }
    const result = await billingService.purchaseCredits(auth.user.id, amount);
    return Response.json(result);
  }

  if (action === 'create_checkout') {
    const session = await billingService.createCheckoutSession(auth.user.id, tier);
    return Response.json(session);
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

export const GET = withRateLimit(withErrorHandling(billingGETHandler));
export const POST = withRateLimit(withErrorHandling(billingPOSTHandler));
