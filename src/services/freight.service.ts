import { logger } from "../lib/logger";
/**
 * Freight Intelligence Engine (Phase 10) — Production
 */

import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';

export interface FreightEstimate {
  origin: string;
  destination: string;
  estimated_days: number;
  rate_per_mt: number;
  carrier: string;
  reliability: number;
}

export class FreightService extends BaseService {
  constructor() {
    super('FreightService');
  }

  async getEstimate(origin: string, destination: string): Promise<FreightEstimate | null> {
    const { data } = await supabaseAdmin
      .from('freight_routes')
      .select('*')
      .or(`origin.ilike.%${origin}%,corridor.ilike.%${origin}%`)
      .or(`destination.ilike.%${destination}%,corridor.ilike.%${destination}%`)
      .limit(1)
      .maybeSingle();

    if (!data) return null;

    return {
      origin: data.origin,
      destination: data.destination,
      estimated_days: data.estimated_transit_days,
      rate_per_mt: data.avg_rate_per_mt,
      carrier: data.carrier,
      reliability: data.reliability_score,
    };
  }

  async saveRoute(route: {
    origin: string;
    destination: string;
    corridor: string;
    estimated_transit_days: number;
    avg_rate_per_mt: number;
    carrier: string;
  }) {
    await supabaseAdmin.from('freight_routes').insert(route);
  }
}

export const freightService = new FreightService();
