/**
 * Billing API — Production Ready
 * All endpoints go through real services.
 */

import { requireAuth } from './middleware/auth';
import { billingService, TIERS } from '../services/billing.service';
import { creditsService } from '../services/credits.service';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const plan = await billingService.getCurrentPlan(auth.user.id);
    const credits = await creditsService.getBalance(auth.user.id);

    return Response.json({
      tier: plan.tier,
      credits,
      tiers: TIERS,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
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
  } catch (error: any) {
    console.error('[Billing API]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
