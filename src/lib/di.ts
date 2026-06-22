/**
 * Production Dependency Injection Container
 * All 35+ services registered here. Use container.get() in production code.
 */
type Factory<T> = () => T;

class Container {
  private services = new Map<string, any>();
  private factories = new Map<string, Factory<any>>();

  register<T>(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }

  registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, instance);
  }

  get<T>(name: string): T {
    if (this.services.has(name)) return this.services.get(name);
    const factory = this.factories.get(name);
    if (!factory) throw new Error(`Service not registered: ${name}`);
    const instance = factory();
    this.services.set(name, instance);
    return instance;
  }

  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  clear() {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = new Container();

// Import all singletons
import { opportunityService } from '../services/opportunity.service';
import { userService } from '../services/user.service';
import { creditsService } from '../services/credits.service';
import { preDealService } from '../services/predeal.service';
import { tradeRadarService } from '../services/trade-radar.service';
import { normalizationService } from '../services/normalization.service';
import { scoringService } from '../services/scoring.service';
import { companyService } from '../services/company.service';
import { complianceService } from '../services/compliance.service';
import { knowledgeGraphService } from '../services/knowledge-graph.service';
import { freightService } from '../services/freight.service';
import { priceIntelligenceService } from '../services/price-intelligence.service';
import { notificationService } from '../services/notification.service';
import { observability } from '../services/observability.service';
import { aiSourcingAgentService } from '../services/ai-sourcing.service';
import { billingService } from '../services/billing.service';
import { stripeService } from '../services/stripe.service';
import { subscriptionService } from '../services/subscription.service';
import { authorizationService } from '../services/authorization.service';
import { jobQueueService } from '../services/job-queue.service';
import { tradeFinanceService } from '../services/trade-finance.service';
import { emailService } from '../services/email.service';
import { notificationDelivery } from '../services/notification-delivery.service';
import { notificationRuleEngine } from '../services/notification-rule.engine';
import { crawlerRegistry } from '../services/crawler.registry';
import { crawlerOrchestrator } from '../services/crawler.orchestrator';
import { baseService } from '../services/base.service'; // optional

export function registerAllServices() {
  container.registerInstance('opportunityService', opportunityService);
  container.registerInstance('userService', userService);
  container.registerInstance('creditsService', creditsService);
  container.registerInstance('preDealService', preDealService);
  container.registerInstance('tradeRadarService', tradeRadarService);
  container.registerInstance('normalizationService', normalizationService);
  container.registerInstance('scoringService', scoringService);
  container.registerInstance('companyService', companyService);
  container.registerInstance('complianceService', complianceService);
  container.registerInstance('knowledgeGraphService', knowledgeGraphService);
  container.registerInstance('freightService', freightService);
  container.registerInstance('priceIntelligenceService', priceIntelligenceService);
  container.registerInstance('notificationService', notificationService);
  container.registerInstance('observability', observability);
  container.registerInstance('aiSourcingAgentService', aiSourcingAgentService);
  container.registerInstance('billingService', billingService);
  container.registerInstance('stripeService', stripeService);
  container.registerInstance('subscriptionService', subscriptionService);
  container.registerInstance('authorizationService', authorizationService);
  container.registerInstance('jobQueueService', jobQueueService);
  container.registerInstance('tradeFinanceService', tradeFinanceService);
  container.registerInstance('emailService', emailService);
  container.registerInstance('notificationDeliveryService', notificationDelivery);
  container.registerInstance('notificationRuleEngine', notificationRuleEngine);
  container.registerInstance('crawlerRegistry', crawlerRegistry);
  container.registerInstance('crawlerOrchestrator', crawlerOrchestrator);

  // Cross-cutting
  const { cache } = require('../lib/cache');
  const { logger } = require('../lib/logger');
  container.registerInstance('cache', cache);
  container.registerInstance('logger', logger);

  // Base if applicable (skip instance if abstract)
}

export { Container };
