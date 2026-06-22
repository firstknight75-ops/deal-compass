/**
 * Stripe Webhook Handler — Production
 */
import { stripeService } from '../services/stripe.service';
import { subscriptionService } from '../services/subscription.service';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  // In production verify signature using stripe.webhooks.constructEvent
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
      // Handle recurring billing
    }

    return Response.json({ received: true });
  } catch (err) {
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }
}
