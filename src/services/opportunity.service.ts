import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { calculateQualityScore } from '../lib/engineUtils';
import { cache, getOrSet } from '../lib/cache';
import { logger } from '../lib/logger';

export interface Opportunity {
  id: string;
  type: string;
  product_name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  currency?: string;
  origin_country?: string;
  export_country?: string;
  incoterm?: string;
  company_name?: string;
  score?: number;
  is_active: boolean;
  source_url?: string;
  created_at: string;
}

export class OpportunityService extends BaseService {
  constructor() {
    super('OpportunityService');
  }

  async getActiveOpportunities(filters: {
    product?: string;
    origin?: string;
    type?: string;
    minScore?: number;
  } = {}): Promise<Opportunity[]> {
    const cacheKey = `opps:${JSON.stringify(filters)}`;

    return getOrSet(cacheKey, async () => {
      let query = supabaseAdmin
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('score', { ascending: false });

      if (filters.product) {
        query = query.ilike('product_name', `%${filters.product}%`);
      }
      if (filters.origin) {
        query = query.or(`origin_country.ilike.%${filters.origin}%,export_country.ilike.%${filters.origin}%`);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.minScore) {
        query = query.gte('score', filters.minScore);
      }

      const { data, error } = await query.limit(200);

      if (error) {
        this.log('error', 'Failed to fetch opportunities', { error });
        logger.error('Opportunity fetch failed', { filters, error: String(error) });
        throw error;
      }

      const result = (data || []).map(this.mapToOpportunity);
      logger.info('Opportunities fetched from DB', { count: result.length, filters });
      return result;
    }, 45); // 45s cache
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToOpportunity(data);
  }

  async createOpportunity(opp: Partial<Opportunity>): Promise<Opportunity> {
    const insertData = {
      type: opp.type || 'sell',
      product_name: opp.product_name,
      category: opp.category,
      quantity: opp.quantity,
      unit: opp.unit,
      price: opp.price,
      currency: opp.currency || 'USD',
      origin_country: opp.origin_country,
      export_country: opp.export_country,
      incoterm: opp.incoterm,
      company_name: opp.company_name,
      source_url: opp.source_url,
      is_active: true,
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Calculate and store score (Engine 3)
    const score = calculateQualityScore(data);
    await supabaseAdmin
      .from('opportunity_scores')
      .insert({
        opportunity_id: data.id,
        total_score: score.total,
        field_completeness: score.fieldCompleteness,
        source_reliability: score.sourceReliability,
        data_freshness: score.dataFreshness,
        cross_source_confirmation: score.crossSourceConfirmation,
      });

    await supabaseAdmin
      .from('products')
      .update({ score: score.total })
      .eq('id', data.id);

    return this.mapToOpportunity({ ...data, score: score.total });
  }

  private mapToOpportunity(row: any): Opportunity {
    return {
      id: row.id,
      type: row.type,
      product_name: row.product_name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      price: row.price,
      currency: row.currency,
      origin_country: row.origin_country,
      export_country: row.export_country,
      incoterm: row.incoterm,
      company_name: row.company_name,
      score: row.score,
      is_active: row.is_active,
      source_url: row.source_url,
      created_at: row.created_at,
    };
  }
}

export const opportunityService = new OpportunityService();
