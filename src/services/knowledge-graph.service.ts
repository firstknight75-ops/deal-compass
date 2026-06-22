import { logger } from "../lib/logger";
/**
 * Trade Knowledge Graph Service (Phase 6)
 * + Caching on relationships
 */
import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { getOrSet } from '../lib/cache';

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
        last_seen_at: new Date().toISOString(),
      });
    }
  }

  async getRelationshipsForCompany(companyId: string): Promise<Relationship[]> {
    const cacheKey = `kg:relationships:${companyId}`;
    return getOrSet(cacheKey, async () => {
      const { data } = await supabaseAdmin
        .from('trade_relationships')
        .select('*')
        .or(`from_company_id.eq.${companyId},to_company_id.eq.${companyId}`)
        .order('strength_score', { ascending: false })
        .limit(50);

      return data || [];
    }, 300);
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
