# Performance Report — DealCompass AI+ (2026-06-22)

## Current Issues
- Background jobs are synchronous loops (no queue)
- Pre-deal generator has O(n*m) matching (N+1 risk)
- No caching layer (Redis or in-memory)
- Limited source crawling in cron (5 sources)
- Large JS bundle (~524kB)

## Wins
- All data via services + Supabase (good separation)
- Atomic credits via Postgres RPC
- Build optimized (after fixes)

## Recommendations
- Introduce BullMQ / Vercel Cron + queue
- Add Redis cache for frequent reads (opps, signals)
- Materialized views for dashboard counts
- Index audit on high-traffic tables
- Code-split large routes

**Performance Score:** 52%
