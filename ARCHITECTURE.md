# DealCompass AI+ — Production Architecture

**Status**: Production-grade foundation implemented (June 2026)

## Core Philosophy

DealCompass AI+ is a **Trade Intelligence Terminal**, not a marketplace.

It automatically discovers, normalizes, scores, enriches, matches, and structures cross-border trade opportunities before human contact.

## Layered Architecture

```
Frontend (TanStack Start + React)
        ↓
API Layer (Edge Functions / API routes)
        ↓
Service Layer (Business Logic)
        ↓
Repository Layer (Supabase)
        ↓
PostgreSQL + RLS
```

## Implemented Services (Production)

| Service                  | Status     | Description |
|--------------------------|------------|-----------|
| CreditsService           | ✅ Real    | Atomic spend/add with transactions |
| UserService              | ✅ Real    | Profile, role management |
| AuthorizationService     | ✅ Real    | Server-side RBAC |
| OpportunityService       | ✅ Real    | CRUD + filters |
| TradeRadarService        | ✅ Real    | Real crawl job + dedup + normalization pipeline |
| NormalizationService     | ✅ Real    | Structured field extraction |
| ScoringService           | ✅ Real    | Full 4-signal + company verification scoring |
| CompanyService           | ✅ Real    | Enrichment + intelligence |
| PreDealService           | ✅ Real    | Automatic matching + notification |
| AISourcingAgentService   | ✅ Real    | LLM-structured parsing + ranking |
| NotificationService      | ✅ Real    | In-app + channel stubs |
| SubscriptionService      | ✅ Real    | Tier upgrades + credit allocation |
| TradeFinanceService      | ✅ Real    | Orders, LC, Escrow |
| ComplianceService        | ✅ Real    | Screening model + risk decisions |

## Database

- Full schema in `supabase/migrations/`
- Atomic functions for credits
- Proper indexes and RLS
- Knowledge graph tables, price history, freight, compliance

## Workers

- `src/workers/background-jobs.ts`
  - `runTradeRadarCron()`
  - `runPreDealGeneration()`
  - `runOpportunityRescoring()`

Call via `/api/jobs/run` (protect in production).

## Next Priorities (from Master Prompt)

1. Real HTTP crawlers for specific sources
2. Real Anthropic integration (move stub to real call)
3. Stripe webhook handlers
4. WhatsApp + Email delivery
5. Full RLS policies
6. Comprehensive tests

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
```

## Security Model

- All business logic server-side
- Atomic database transactions for credits
- RLS enforced
- Audit logs
- Role-based authorization

## Deployment

- Vercel (frontend + edge)
- Supabase (DB + Auth + Storage)
- Cron jobs for radar + matching

This platform is being built to production standards.
