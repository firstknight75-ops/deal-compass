/**
 * Production Startup Validation + Initialization
 * Wires EventBus listeners + registers everything.
 */
import { getConfig, isFeatureEnabled } from './config';
import { logger } from './logger';
import { container, registerAllServices } from './di';
import { cache } from './cache';
import { observability } from '../services/observability.service';
import { eventBus, EVENTS } from './event-bus';

let initialized = false;

export function runStartupValidation() {
  if (initialized) return;

  const config = getConfig();

  logger.info('Starting DealCompass AI+ Platform Foundation initialization', {
    env: config.NODE_ENV,
    features: config.features,
  });

  // 1. Environment validation
  if (!config.VITE_SUPABASE_URL || !config.VITE_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Critical: Missing required Supabase environment variables');
  }

  // 2. Register ALL services via the central function
  try {
    registerAllServices();
    container.registerInstance('cache', cache);
    container.registerInstance('observability', observability);

    logger.info('All 35+ services registered in DI container');
  } catch (err) {
    logger.error('Failed to register services in DI', { error: String(err) });
    throw err;
  }

  // 3. === EVENT BUS LISTENERS (minimal wiring at boot) ===
  eventBus.on(EVENTS.OPPORTUNITY_CREATED, (payload) => {
    logger.info('[Event] Opportunity created', payload);
    observability.incrementMetric('events.opportunity.created', 1);
  });

  eventBus.on(EVENTS.CREDITS_SPENT, (payload) => {
    logger.info('[Event] Credits spent', payload);
    observability.incrementMetric('events.credits.spent', payload.amount || 1);
  });

  eventBus.on(EVENTS.PRE_DEAL_GENERATED, (payload) => {
    logger.info('[Event] Pre-deals generated', payload);
    observability.incrementMetric('events.predeal.generated', payload.generated || 0);
  });

  eventBus.on(EVENTS.BILLING_UPGRADED, (payload) => {
    logger.info('[Event] Billing upgraded', payload);
    observability.incrementMetric('events.billing.upgraded', 1);
  });

  eventBus.on(EVENTS.USER_UPDATED, (payload) => {
    logger.info('[Event] User updated', payload);
    observability.incrementMetric('events.user.updated', 1);
  });

  logger.info('EventBus listeners registered');

  // 4. Feature flag metrics
  observability.incrementMetric('startup.feature.real_crawler', isFeatureEnabled('realCrawler') ? 1 : 0);
  observability.incrementMetric('startup.feature.ai_agent', isFeatureEnabled('aiAgent') ? 1 : 0);
  observability.incrementMetric('startup.feature.rate_limiting', isFeatureEnabled('rateLimiting') ? 1 : 0);
  observability.incrementMetric('startup.feature.caching', isFeatureEnabled('caching') ? 1 : 0);

  // 5. Health check at boot
  try {
    const health = observability.getMetrics();
    logger.info('Platform Foundation ready', {
      caching: isFeatureEnabled('caching'),
      rateLimiting: isFeatureEnabled('rateLimiting'),
      metrics: Object.keys(health).length,
      eventBusListeners: 'registered',
    });
  } catch (e) {
    logger.warn('Health check at startup had issues', { error: String(e) });
  }

  initialized = true;
  logger.info('DealCompass AI+ startup validation completed successfully');
}

// Auto-run in server contexts
if (typeof window === 'undefined') {
  try {
    runStartupValidation();
  } catch (e) {
    console.error('[STARTUP] Validation failed:', e);
  }
}

export { initialized };
