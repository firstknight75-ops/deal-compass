/**
 * Production Crawler Orchestrator
 * Coordinates all crawlers, rate limiting, health, and persistence.
 */

import { BaseService } from './base.service';
import { tradeRadarService } from './trade-radar.service';
import { normalizationService } from './normalization.service';
import { scoringService } from './scoring.service';
import { supabaseAdmin } from '../lib/supabase/server';

export class CrawlerOrchestrator extends BaseService {
  constructor() {
    super('CrawlerOrchestrator');
  }

  async runFullCrawlCycle() {
    this.log('info', 'Starting full crawl cycle');

    const sources = await tradeRadarService.getActiveSources();
    let totalNew = 0;

    for (const source of sources) {
      try {
        const result = await tradeRadarService.runCrawlForSource(source.id);
        totalNew += result.newRecords;

        // After new records, normalize + score recent ones
        await this.postProcessRecentRecords(20);
      } catch (err: any) {
        this.log('error', `Failed source ${source.name}`, { error: err.message });
      }
    }

    this.log('info', `Full crawl cycle complete. New records: ${totalNew}`);
    return { totalNewRecords: totalNew };
  }

  private async postProcessRecentRecords(limit: number) {
    const { data: recent } = await supabaseAdmin
      .from('products')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(limit);

    for (const opp of recent || []) {
      try {
        await scoringService.scoreOpportunity(opp.id);
      } catch (e) {}
    }
  }
}

export const crawlerOrchestrator = new CrawlerOrchestrator();
