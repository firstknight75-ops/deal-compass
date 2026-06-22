import { supabaseAdmin } from '../lib/supabase/server';
import { z } from 'zod';
import { eventBus, EVENTS } from '../lib/event-bus';
import { getOrSet, cache } from '../lib/cache';

export interface CreditsTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'spend' | 'purchase' | 'monthly_allocation' | 'refund';
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

const SpendCreditsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  referenceId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export class CreditsService {
  async spendCredits(input: z.infer<typeof SpendCreditsSchema>): Promise<boolean> {
    const parsed = SpendCreditsSchema.parse(input);
    const { userId, amount, referenceId, metadata } = parsed;

    const { data, error } = await supabaseAdmin.rpc('spend_credits_atomic', {
      p_user_id: userId,
      p_amount: amount,
      p_reference_id: referenceId || null,
      p_metadata: metadata || {},
    });

    if (error) {
      console.error('[CreditsService] spendCredits error:', error);
      throw new Error('Failed to spend credits');
    }

    if (data === true) {
      // Invalidate balance cache
      cache.delete(`credits:balance:${userId}`);

      await eventBus.emit(EVENTS.CREDITS_SPENT, {
        userId,
        amount,
        referenceId,
        timestamp: new Date().toISOString(),
      });
    }

    return data === true;
  }

  async addCredits(
    userId: string,
    amount: number,
    type: 'purchase' | 'monthly_allocation' | 'refund',
    referenceId?: string
  ): Promise<void> {
    const { error } = await supabaseAdmin.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_reference_id: referenceId,
    });

    if (error) throw new Error('Failed to add credits: ' + error.message);

    // Invalidate balance
    cache.delete(`credits:balance:${userId}`);
  }

  async getBalance(userId: string): Promise<number> {
    const cacheKey = `credits:balance:${userId}`;

    return getOrSet(cacheKey, async () => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('credits_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.credits_balance ?? 0;
    }, 60);
  }

  async getTransactionHistory(userId: string, limit = 50): Promise<CreditsTransaction[]> {
    return getOrSet(`credits:history:${userId}:${limit}`, async () => {
      const { data, error } = await supabaseAdmin
        .from('credits_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }, 120);
  }
}

export const creditsService = new CreditsService();
