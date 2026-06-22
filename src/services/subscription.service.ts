import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';

export class SubscriptionService extends BaseService {
  constructor() {
    super('SubscriptionService');
  }

  async upgradeTier(userId: string, newTier: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ account_tier: newTier })
      .eq('id', userId);

    if (error) throw error;

    // Allocate initial credits for the tier
    const credits = this.getCreditsForTier(newTier);
    if (credits > 0) {
      await supabaseAdmin.rpc('add_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_type: 'purchase',
      });
    }

    this.log('info', `User ${userId} upgraded to ${newTier}`);
  }

  private getCreditsForTier(tier: string): number {
    const map: Record<string, number> = {
      bronze: 10,
      silver: 30,
      gold: 100,
      platinum: 9999,
    };
    return map[tier] || 0;
  }
}

export const subscriptionService = new SubscriptionService();
