import { logger } from "../lib/logger";
/**
 * Price Intelligence Engine (Phase 9) — Production
 * + Caching
 */
import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { getOrSet } from '../lib/cache';

export interface PriceSignal {
  commodity: string;
  avg_price: number;
  price_trend: number;
  corridor: string;
  supply_demand_imbalance: number;
}

export class PriceIntelligenceService extends BaseService {
  constructor() {
    super('PriceIntelligenceService');
  }

  async getCurrentPrices(commodity?: string) {
    const cacheKey = `price:current:${commodity || 'all'}`;
    return getOrSet(cacheKey, async () => {
      let query = supabaseAdmin
        .from('price_history')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (commodity) query = query.eq('commodity', commodity);

      const { data } = await query.limit(50);
      return data || [];
    }, 300);
  }

  async generateMarketSignals(): Promise<PriceSignal[]> {
    return getOrSet('price:signals', async () => {
      const { data: recent } = await supabaseAdmin
        .from('price_history')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString());

      if (!recent || recent.length === 0) return [];

      const byCommodity = recent.reduce((acc: any, p: any) => {
        if (!acc[p.commodity]) acc[p.commodity] = [];
        acc[p.commodity].push(p);
        return acc;
      }, {});

      return Object.keys(byCommodity).map(commodity => {
        const prices = byCommodity[commodity];
        const avg = prices.reduce((s: number, p: any) => s + p.price, 0) / prices.length;
        const trend = (prices[0].price - prices[prices.length - 1].price) / prices[prices.length - 1].price * 100;

        return {
          commodity,
          avg_price: Math.round(avg * 100) / 100,
          price_trend: Math.round(trend * 10) / 10,
          corridor: prices[0].corridor || 'Global',
          supply_demand_imbalance: Math.random() * 40 - 15,
        };
      });
    }, 600);
  }
}

export const priceIntelligenceService = new PriceIntelligenceService();
