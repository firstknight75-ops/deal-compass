/**
 * Billing Service — Production Grade (Complete)
 * + Caching + invalidation
 */
import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { creditsService } from './credits.service';
import { subscriptionService } from './subscription.service';
import { stripeService } from './stripe.service';
import { eventBus, EVENTS } from '../lib/event-bus';
import { getOrSet, cache } from '../lib/cache';

export interface Tier {
  name: string;
  price: number;
  credits: number;
  features: string[];
}

export const TIERS: Tier[] = [
  { name: 'Bronze',   price: 49,  credits: 10,   features: ['Opportunity scores', 'Basic alerts'] },
  { name: 'Silver',   price: 149, credits: 30,   features: ['Pre-deals', 'AI Agent basic'] },
  { name: 'Gold',     price: 349, credits: 100,  features: ['Market Intelligence', 'Priority matching', 'Reduced fees'] },
  { name: 'Platinum', price: 749, credits: 9999, features: ['Unlimited credits', 'Advanced AI', 'Dedicated manager', 'API access'] },
];

export class BillingService extends BaseService {
  constructor() {
    super('BillingService');
  }

  async getTiers(): Promise<Tier[]> {
    return getOrSet('billing:tiers', async () => TIERS, 3600); // 1hr
  }

  async getCurrentPlan(userId: string) {
    const cacheKey = `billing:plan:${userId}`;
    return getOrSet(cacheKey, async () => {
      const { data } = await supabaseAdmin
        .from('users')
        .select('account_tier, credits_balance')
        .eq('id', userId)
        .single();

      return {
        tier: data?.account_tier || 'free',
        credits: data?.credits_balance || 0,
      };
    }, 60);
  }

  async upgradeTier(userId: string, tierName: string) {
    const tier = TIERS.find(t => t.name.toLowerCase() === tierName.toLowerCase());
    if (!tier) throw new Error('Invalid tier');

    await subscriptionService.upgradeTier(userId, tier.name.toLowerCase());
    await creditsService.addCredits(userId, tier.credits, 'purchase');

    // Invalidate plan cache
    cache.delete(`billing:plan:${userId}`);

    this.log('info', `User upgraded to tier`, { userId, tier: tier.name });

    await eventBus.emit(EVENTS.BILLING_UPGRADED, {
      userId,
      tier: tier.name,
      creditsAdded: tier.credits,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      tier: tier.name,
      creditsAdded: tier.credits,
    };
  }

  async purchaseCredits(userId: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');

    await creditsService.addCredits(userId, amount, 'purchase');
    cache.delete(`billing:plan:${userId}`);

    this.log('info', `Credits purchased`, { userId, amount });
    return { success: true, creditsAdded: amount };
  }

  async createCheckoutSession(userId: string, tierName: string) {
    const tier = TIERS.find(t => t.name.toLowerCase() === tierName.toLowerCase());
    if (!tier) throw new Error('Invalid tier');

    const session = await stripeService.createCheckoutSession(
      userId,
      tier.name.toLowerCase(),
      `price_${tier.name.toLowerCase()}`
    );

    return session;
  }

  async getSubscriptionStatus(userId: string) {
    return getOrSet(`billing:subscription:${userId}`, async () => {
      const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return data || null;
    }, 300);
  }
}

export const billingService = new BillingService();
