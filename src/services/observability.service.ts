/**
 * Production Observability Service
 * Structured logging, metrics, health checks
 */

import { BaseService } from './base.service';

export class ObservabilityService extends BaseService {
  private metrics: Record<string, number> = {};

  constructor() {
    super('Observability');
  }

  logEvent(service: string, event: string, meta?: Record<string, any>) {
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
    return { ...this.metrics };
  }

  async healthCheckAll(services: BaseService[]) {
    const results = await Promise.all(
      services.map(async s => ({
        service: s.getName(),
        health: await s.healthCheck(),
      }))
    );
    return results;
  }
}

export const observability = new ObservabilityService();
