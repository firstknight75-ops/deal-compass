/**
 * Stripe Integration Service (Production stub + real structure)
 */

import { BaseService } from './base.service';

export class StripeService extends BaseService {
  private secretKey: string;

  constructor() {
    super('StripeService');
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  async createCheckoutSession(userId: string, tier: string, priceId: string) {
    if (!this.secretKey) {
      // In development, return mock session
      return {
        id: 'cs_test_' + Date.now(),
        url: `/billing?mock=success&tier=${tier}`,
        mock: true,
      };
    }

    // Real Stripe call would go here using stripe npm package
    // For now we return a structure ready for real implementation
    return {
      id: 'cs_live_placeholder',
      url: 'https://checkout.stripe.com/placeholder',
      requiresRealKey: true,
    };
  }

  async handleWebhook(event: any) {
    this.log('info', 'Stripe webhook received', { type: event.type });
    // Implement subscription.updated, invoice.paid, etc.
    return { received: true };
  }
}

export const stripeService = new StripeService();
