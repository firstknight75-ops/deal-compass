import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { notificationService } from './notification.service';
import { getOrSet } from '../lib/cache';
import { logger } from '../lib/logger';

export class PreDealService extends BaseService {
  constructor() {
    super('PreDealService');
  }

  async generatePreDeals(): Promise<number> {
    // Use cache for the expensive matching query
    return getOrSet('predeals:generated', async () => {
      const { data: supplies } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('type', 'sell')
        .gte('score', 75)
        .limit(100);

      const { data: demands } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('type', 'buy')
        .limit(100);

      let created = 0;

      for (const supply of supplies || []) {
        for (const demand of demands || []) {
          if (this.isGoodMatch(supply, demand)) {
            const matchScore = this.calculateMatchScore(supply, demand);

            const { data: existing } = await supabaseAdmin
              .from('pre_deals')
              .select('id')
              .eq('supply_opportunity_id', supply.id)
              .eq('demand_opportunity_id', demand.id)
              .maybeSingle();

            if (existing) continue;

            const { data: preDeal } = await supabaseAdmin
              .from('pre_deals')
              .insert({
                supply_opportunity_id: supply.id,
                demand_opportunity_id: demand.id,
                suggested_price: Math.round(supply.price * 0.97),
                suggested_quantity: Math.min(supply.quantity, demand.quantity || supply.quantity),
                match_score: matchScore,
                payment_recommendation: 'LC at sight or Escrow',
                status: 'pending',
                expires_at: new Date(Date.now() + 1000 * 3600 * 72).toISOString(),
              })
              .select()
              .single();

            created++;

            // Notify both parties
            await notificationService.sendNotification({
              userId: supply.company_id || 'system',
              type: 'pre_deal_generated',
              title: 'New Pre-Deal Match',
              message: `Match found for ${supply.product_name} (${matchScore}% match)`,
              metadata: { pre_deal_id: preDeal?.id },
            });
          }
        }
      }

      this.log('info', `Generated ${created} pre-deals`);
      logger.info('Pre-deals generated', { created });
      return created;
    }, 180); // 3 minute cache for expensive generation
  }

  private isGoodMatch(supply: any, demand: any): boolean {
    if (supply.category !== demand.category) return false;
    if (supply.origin_country !== demand.origin_country && supply.export_country !== demand.export_country) return false;
    if (supply.price > (demand.price || supply.price * 1.3)) return false;
    return true;
  }

  private calculateMatchScore(supply: any, demand: any): number {
    let score = 70;
    if (supply.score) score += Math.min(15, (supply.score - 70) / 2);
    if (supply.origin_country === demand.origin_country) score += 8;
    return Math.min(96, Math.floor(score));
  }

  async respondToPreDeal(preDealId: string, userId: string, status: 'accepted' | 'rejected' | 'countered') {
    const { data: preDeal } = await supabaseAdmin
      .from('pre_deals')
      .update({ status })
      .eq('id', preDealId)
      .select()
      .single();

    if (status === 'accepted') {
      // Create order
      await supabaseAdmin.from('orders').insert({
        pre_deal_id: preDealId,
        buyer_id: preDeal?.demand_opportunity_id ? userId : preDeal?.supply_opportunity_id,
        seller_id: preDeal?.supply_opportunity_id ? userId : preDeal?.demand_opportunity_id,
        status: 'pending',
      });
    }

    return preDeal;
  }
}

export const preDealService = new PreDealService();
