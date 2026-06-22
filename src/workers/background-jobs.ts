/**
 * Background Job System (Production)
 * 
 * These functions are meant to be called from:
 * - Vercel Cron
 * - Supabase Edge Functions
 * - Or a dedicated worker (BullMQ, Temporal, etc.)
 */

import { tradeRadarService } from '../services/trade-radar.service';
import { preDealService } from '../services/predeal.service';
import { scoringService } from '../services/scoring.service';
import { notificationService } from '../services/notification.service';

export async function runTradeRadarCron() {
  console.log('[WORKER] Starting Trade Radar crawl...');
  
  const sources = await tradeRadarService.getActiveSources();
  
  let totalNew = 0;

  for (const source of sources.slice(0, 5)) { // Limit for safety
    try {
      const result = await tradeRadarService.runCrawlForSource(source.id);
      totalNew += result.newRecords;
      console.log(`[WORKER] ${source.name}: ${result.newRecords} new records`);
    } catch (err) {
      console.error(`[WORKER] Failed source ${source.name}`, err);
    }
  }

  return { totalNewRecords: totalNew };
}

export async function runPreDealGeneration() {
  console.log('[WORKER] Generating pre-deals...');
  const count = await preDealService.generatePreDeals();
  return { preDealsGenerated: count };
}

export async function runOpportunityRescoring() {
  console.log('[WORKER] Rescoring opportunities...');
  const { data: opps } = await (await import('../lib/supabase/server')).supabaseAdmin
    .from('products')
    .select('id')
    .eq('is_active', true)
    .limit(200);

  let scored = 0;
  for (const opp of opps || []) {
    try {
      await scoringService.scoreOpportunity(opp.id);
      scored++;
    } catch (e) {}
  }
  return { opportunitiesRescored: scored };
}

// Can be called by cron
export async function runAllBackgroundJobs() {
  const radar = await runTradeRadarCron();
  const predeals = await runPreDealGeneration();
  const rescoring = await runOpportunityRescoring();

  return {
    ...radar,
    ...predeals,
    ...rescoring,
    ranAt: new Date().toISOString(),
  };
}
