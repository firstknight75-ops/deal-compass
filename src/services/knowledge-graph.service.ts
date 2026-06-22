import { logger } from "../lib/logger";
/**
 * Trade Knowledge Graph Service (Phase 6)
 * This is the proprietary data moat.
 */

import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';

export interface Relationship {
  from_company_id: string;
  to_company_id: string;
  relationship_type: string;
  strength_score: number;
  evidence_count: number;
}

export class KnowledgeGraphService extends BaseService {
  constructor() {
    super('KnowledgeGraphService');
  }

  async recordRelationship(params: {
    fromCompanyId: string;
    toCompanyId: string;
    type: string;
    strength?: number;
  }) {
    const { fromCompanyId, toCompanyId, type, strength = 55 } = params;

    // Upsert with strength increase on repeated evidence
    const { data: existing } = await supabaseAdmin
      .from('trade_relationships')
      .select('*')
      .eq('from_company_id', fromCompanyId)
      .eq('to_company_id', toCompanyId)
      .eq('relationship_type', type)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from('trade_relationships')
        .update({
          strength_score: Math.min(98, existing.strength_score + 4),
          evidence_count: existing.evidence_count + 1,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('trade_relationships').insert({
        from_company_id: fromCompanyId,
        to_company_id: toCompanyId,
        relationship_type: type,
        strength_score: strength,
        evidence_count: 1,
      });
    }
  }

  async getCompanyNetwork(companyId: string, limit = 25) {
    const { data } = await supabaseAdmin
      .from('trade_relationships')
      .select(`
        *,
        from:companies!from_company_id(id, name, country),
        to:companies!to_company_id(id, name, country)
      `)
      .or(`from_company_id.eq.${companyId},to_company_id.eq.${companyId}`)
      .order('strength_score', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getTradeFlowMap(corridor?: string) {
    // Simplified trade flow aggregation
    let query = supabaseAdmin
      .from('trade_relationships')
      .select('relationship_type, strength_score, from:companies!from_company_id(country), to:companies!to_company_id(country)');

    if (corridor) {
      // In production would filter by corridor logic
    }

    const { data } = await query.limit(100);
    return data || [];
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
