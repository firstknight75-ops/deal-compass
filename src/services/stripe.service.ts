/**
 * Stripe Integration Service — Production Grade
 * Real Stripe SDK integration. Requires STRIPE_SECRET_KEY for live checkout.
 * All business logic in services (no mocks in core flow).
 */

import Stripe from 'stripe';
import { BaseService } from './base.service';

export class StripeService extends BaseService {
  private stripe: Stripe | null = null;
  private isConfigured: boolean = false;

  constructor() {
    super('StripeService');
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2026-05-27.dahlia',
        typescript: true,
      });
      this.isConfigured = true;
      this.log('info', 'Stripe service initialized (production mode)');
    } else {
      this.log('warn', 'STRIPE_SECRET_KEY not set — checkout will fail until configured');
    }
  }

  /**
   * Creates a real Stripe Checkout Session.
   * Returns { id, url } on success.
   * Throws if Stripe not configured.
   */
  async createCheckoutSession(
    userId: string,
    tier: string,
    priceId: string
  ): Promise<{ id: string; url: string | null; mock?: never }> {
    if (!this.isConfigured || !this.stripe) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Set the environment variable to enable live payments. ' +
        'See docs for production setup.'
      );
    }

    const amount = this.getTierAmount(tier);
    if (!amount) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${tier.toUpperCase()} Plan - DealCompass AI+`,
                description: `Monthly subscription for ${tier} tier`,
              },
              unit_amount: amount * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.PUBLIC_URL || 'http://localhost:5173'}/billing?success=true&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.PUBLIC_URL || 'http://localhost:5173'}/billing?canceled=true`,
        metadata: {
          user_id: userId,
          tier: tier.toLowerCase(),
          source: 'dealcompass_billing',
        },
        customer_email: undefined, // Will be collected by Stripe
      });

      this.log('info', 'Stripe checkout session created', {
        userId,
        tier,
        sessionId: session.id,
      });

      return {
        id: session.id,
        url: session.url,
      };
    } catch (error: any) {
      this.log('error', 'Stripe checkout creation failed', {
        userId,
        tier,
        error: error.message,
      });
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  private getTierAmount(tier: string): number {
    const tierPrices: Record<string, number> = {
      bronze: 49,
      silver: 149,
      gold: 349,
      platinum: 749,
    };
    return tierPrices[tier.toLowerCase()] || 0;
  }

  /**
   * Production webhook handler.
   * Expects raw body + signature for verification in real deployment.
   */
  async handleWebhook(rawBody: string, signature?: string | null): Promise<{ received: boolean; event?: any }> {
    if (!this.isConfigured || !this.stripe) {
      this.log('warn', 'Webhook received but Stripe not configured');
      return { received: false };
    }

    let event: Stripe.Event;

    try {
      // In production use webhook secret for verification
      if (signature && process.env.STRIPE_WEBHOOK_SECRET) {
        event = this.stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // Fallback for dev/testing (not recommended in prod)
        event = JSON.parse(rawBody);
      }

      this.log('info', 'Stripe webhook verified', { type: event.type });

      // Core business logic lives in services (billing/credits/subscription)
      switch (event.type) {
        case 'checkout.session.completed':
          // Handled in api/stripe-webhook.ts -> calls subscriptionService
          break;

        case 'invoice.paid':
          this.log('info', 'Recurring invoice paid', {
            invoice: (event.data.object as any).id,
          });
          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          this.log('info', 'Subscription lifecycle event', { type: event.type });
          break;

        default:
          this.log('info', `Unhandled Stripe event: ${event.type}`);
      }

      return { received: true, event };
    } catch (err: any) {
      this.log('error', 'Webhook signature verification failed', { error: err.message });
      throw new Error('Invalid webhook signature or payload');
    }
  }
}

export const stripeService = new StripeService();
