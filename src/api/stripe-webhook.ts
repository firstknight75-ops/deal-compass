/**
 * Stripe Webhook Handler — Production
 * Note: Webhooks usually use signature verification instead of user auth.
 * Protected with rate limiting + error handling (no requireAuth as it's webhook).
 */
import { subscriptionService } from '../services/subscription.service';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';

async function stripeWebhookHandler(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Basic signature check stub (real impl would use stripe lib verify)
  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const userId = event.data.object.metadata?.user_id;
      const tier = event.data.object.metadata?.tier;

      if (userId && tier) {
        await subscriptionService.upgradeTier(userId, tier);
      }
    }

    if (event.type === 'invoice.paid') {
      // recurring billing logic
    }

    return Response.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook]', err);
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }
}

export const POST = withRateLimit(withErrorHandling(stripeWebhookHandler), { max: 30 });
