/**
 * AI Sourcing Agent — Production Service (Phase 7)
 * + Caching on query results
 */
import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { parseSourcingRequestWithLLM, StructuredSourcingFilters } from '../lib/anthropicStub';
import { parseSourcingQueryWithClaude } from '../lib/anthropic';
import { opportunityService, Opportunity } from './opportunity.service';
import { getOrSet } from '../lib/cache';

export interface SourcingResult {
  opportunity: Opportunity;
  match_score: number;
  match_explanation: string;
}

export class AISourcingAgentService extends BaseService {
  constructor() {
    super('AISourcingAgentService');
  }

  async processNaturalLanguageQuery(
    query: string,
    userId?: string
  ): Promise<{
    parsed_filters: StructuredSourcingFilters;
    results: SourcingResult[];
    total_matches: number;
  }> {
    const cacheKey = `ai-sourcing:${query.slice(0, 64)}:${userId || 'anon'}`;

    return getOrSet(cacheKey, async () => {
      let parsed: StructuredSourcingFilters;
      try {
        if (process.env.ANTHROPIC_API_KEY) {
          const claudeResult = await parseSourcingQueryWithClaude(query);
          parsed = claudeResult.error ? await parseSourcingRequestWithLLM(query) : claudeResult;
        } else {
          parsed = await parseSourcingRequestWithLLM(query);
        }
      } catch {
        parsed = await parseSourcingRequestWithLLM(query);
      }

      this.log('info', 'Parsed sourcing request', { query, parsed });

      const opportunities = await opportunityService.getActiveOpportunities({
        product: parsed.product_name,
        origin: parsed.origin_country || parsed.export_country,
      });

      const ranked: SourcingResult[] = opportunities
        .map(opp => {
          const matchScore = this.calculateMatchScore(opp, parsed);
          return {
            opportunity: opp,
            match_score: matchScore,
            match_explanation: this.generateExplanation(opp, parsed, matchScore),
          };
        })
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 12);

      return {
        parsed_filters: parsed,
        results: ranked,
        total_matches: ranked.length,
      };
    }, 120); // 2 min cache for expensive AI queries
  }

  private calculateMatchScore(opp: Opportunity, filters: StructuredSourcingFilters): number {
    let score = 55;
    if (filters.product_name && opp.product_name?.toLowerCase().includes(filters.product_name.toLowerCase().slice(0, 6))) {
      score += 25;
    }
    if (filters.origin_country && (opp.origin_country === filters.origin_country || opp.export_country === filters.origin_country)) {
      score += 12;
    }
    if (filters.min_quantity && opp.quantity && opp.quantity >= filters.min_quantity * 0.7) {
      score += 8;
    }
    if (filters.incoterm && opp.incoterm === filters.incoterm) {
      score += 6;
    }
    if (opp.score) score += Math.min(12, (opp.score - 70) / 3);
    return Math.min(97, Math.floor(score));
  }

  private generateExplanation(opp: Opportunity, filters: StructuredSourcingFilters, score: number): string {
    const reasons: string[] = [];
    if (filters.product_name && opp.product_name?.toLowerCase().includes(filters.product_name.toLowerCase().slice(0, 6))) {
      reasons.push('Product match');
    }
    if (filters.origin_country) reasons.push('Corridor alignment');
    if (opp.score && opp.score > 80) reasons.push('High quality score');
    return reasons.length > 0 ? reasons.join(' • ') : 'Good overall match';
  }
}

export const aiSourcingAgentService = new AISourcingAgentService();
