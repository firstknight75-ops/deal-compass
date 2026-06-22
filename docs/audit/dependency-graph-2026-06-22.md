# Dependency Graph — DealCompass AI+ (2026-06-22)

## Core Modules & Dependencies

### 1. Platform Foundation (PHASE 1 — Priority)
**Module**: Config + Error Handling + Logging + Observability + Queue
**Depends on**: 
- Supabase (DB + Auth)
- Environment variables
**Provides to**: All other modules
**DB Tables**: `audit_logs`, `idempotency_keys` (existing)
**Background Jobs**: None yet
**Events**: logEvent, metrics
**External**: None

### 2. Backend Core Services (PHASE 2)
**Modules**: User, Credits, Authorization, Subscription, Notification, File
**Depends on**: Platform Foundation, Auth middleware
**DB Tables**: `users`, `credits_transactions`, `subscriptions`, `audit_logs`
**Background Jobs**: Monthly credits allocation
**Events**: user.updated, credits.spent
**External**: Stripe (via billing)

### 3. Enterprise Platform (PHASE 3)
**Modules**: Organization, Team, RBAC, SSO, API Platform
**Depends on**: Core Services
**DB Tables**: `organizations`, `organization_members`, `teams`, `api_keys`
**Background Jobs**: Seat usage sync
**Events**: org.member.added
**External**: Google Workspace, Microsoft Entra, SAML

### 4. Trade Radar Engine (PHASE 4)
**Module**: Crawler Framework + TradeRadarService
**Depends on**: Platform Foundation, OpportunityService, Normalization
**DB Tables**: `crawl_sources`, `crawl_jobs`, `raw_documents`, `crawl_logs`, `source_health`
**Background Jobs**: `runTradeRadarCron`
**Events**: crawl.completed, source.health.updated
**External**: HTTP sources, proxies (future)

### 5. AI Normalization + Opportunity Intelligence (PHASE 5-7)
**Modules**: NormalizationService, ScoringService
**Depends on**: Trade Radar, Platform
**DB Tables**: `normalized_records`, `opportunity_scores`, `products`
**Background Jobs**: Rescore jobs
**Events**: opportunity.scored
**External**: Anthropic (Claude)

### 6. Company Intelligence + Knowledge Graph (PHASE 8-9)
**Modules**: CompanyService, KnowledgeGraphService
**Depends on**: Opportunities, Normalization, Radar
**DB Tables**: `companies`, `trade_relationships`, `company_scores`
**Background Jobs**: Enrichment cron
**Events**: company.enriched, relationship.created
**External**: Domain WHOIS, registries (future)

### 7. Pre-Deal + Market + Freight (PHASE 10-13)
**Modules**: PreDealService, PriceIntelligence, Freight
**Depends on**: Opportunities, Company, Graph
**DB Tables**: `pre_deals`, `price_history`, `routes`
**Background Jobs**: Pre-deal generation
**Events**: pre_deal.generated, price.updated

### 8. AI Sourcing + Recommendation (PHASE 12,19)
**Module**: AISourcingAgentService + RecommendationEngine
**Depends on**: Graph, PreDeal, Market, Scoring
**DB Tables**: (uses existing + search index)
**External**: Anthropic

### 9. Compliance + Trade Finance + CRM (PHASE 15-17)
**Depends on**: Core + Graph + PreDeal
**DB Tables**: `compliance_screenings`, `orders`, `crm_leads`

### 10. Rules + Workflow + Search + Observability (PHASE 18,20-22)
**Depends on**: All core + services

## Execution Order (Strict — Never Violate)
1. Platform Foundation (Config, Error, Logging, Queue, Observability)
2. Backend Core Services (Auth, User, Credits, RBAC)
3. Enterprise + API Platform
4. Trade Radar + Crawler (real sources)
5. Normalization + Scoring + Opportunity
6. Company + Knowledge Graph
7. Market + Freight + Pre-Deal
8. AI Sourcing Agent + Recommendations
9. Compliance + Finance + CRM + Negotiation
10. Rules + Workflow + Search
11. Full Observability + Data Governance + Security Hardening
12. Testing + Production Readiness (80%+ coverage)

**Current State**: Mock pollution module complete (PHASE 0 cleanup). 
Next: Fix issues (build, auth fallbacks, debt) then Platform Foundation.

## Key Cross-Cutting
- All modules must use services only (no logic in routes/components)
- All data access via services (future: repositories)
- Observability + audit logging on every critical path
- Auth middleware on every API route
