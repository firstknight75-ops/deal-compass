/**
 * Production Observability Service
 * Structured logging, metrics, health checks, basic tracing
 * Now integrated with new platform logger + config.
 */

import { BaseService } from './base.service';
import { logger } from '../lib/logger';
import { getConfig } from '../lib/config';

export class ObservabilityService extends BaseService {
  private metrics: Record<string, number> = {};
  private traces: Array<{ ts: string; name: string; durationMs?: number; meta?: any }> = [];

  constructor() {
    super('Observability');
  }

  logEvent(service: string, event: string, meta?: Record<string, any>) {
    logger.info(`[${service}] ${event}`, { service, ...meta });
    // Also keep legacy for backward compat
    const payload = {
      ts: new Date().toISOString(),
      service,
      event,
      ...meta,
    };
    console.log(JSON.stringify(payload));
  }

  incrementMetric(name: string, value = 1) {
    this.metrics[name] = (this.metrics[name] || 0) + value;
  }

  getMetrics() {
    return { 
      ...this.metrics,
      platform: {
        env: getConfig().NODE_ENV,
        features: getConfig().features,
      }
    };
  }

  // Basic distributed tracing skeleton
  startTrace(name: string, meta?: any) {
    const trace = { ts: new Date().toISOString(), name, meta };
    this.traces.push(trace);
    if (this.traces.length > 200) this.traces.shift();
    return trace;
  }

  endTrace(name: string, durationMs: number, meta?: any) {
    const trace = this.traces.find(t => t.name === name && !t.durationMs);
    if (trace) {
      trace.durationMs = durationMs;
      if (meta) trace.meta = { ...trace.meta, ...meta };
    }
    logger.debug(`trace:${name}`, { durationMs, ...meta });
  }

  getRecentTraces(limit = 20) {
    return this.traces.slice(-limit);
  }

  async healthCheckAll(services: BaseService[]) {
    const results = await Promise.all(
      services.map(async s => ({
        service: s.getName(),
        health: await s.healthCheck(),
      }))
    );
    this.incrementMetric('health.checks', 1);
    return results;
  }
}

export const observability = new ObservabilityService();
