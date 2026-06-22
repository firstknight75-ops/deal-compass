-- Phase 2-5: Trade Radar, Normalization, Scoring, Company Intelligence, Pre-Deals, Knowledge Graph foundation

-- Additional tables for full engine support

CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    country TEXT,
    website_verified BOOLEAN DEFAULT false,
    estimated_employees TEXT,
    estimated_revenue NUMERIC,
    trade_activity_score NUMERIC(5,2) DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.company_enrichments (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    activity_tier TEXT,
    response_probability NUMERIC(5,2),
    fraud_probability NUMERIC(5,2),
    last_enriched_at TIMESTAMPTZ,
    enrichment_sources TEXT[]
);

-- Knowledge Graph edges (Phase 6 foundation)
CREATE TABLE public.trade_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_company_id UUID REFERENCES public.companies(id),
    to_company_id UUID REFERENCES public.companies(id),
    relationship_type TEXT NOT NULL, -- BUYER_OF, SUPPLIER_OF, SHIPPED_TO, etc.
    strength_score NUMERIC(5,2) DEFAULT 50,
    evidence_count INTEGER DEFAULT 1,
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Intelligence (Phase 9)
CREATE TABLE public.price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    unit TEXT DEFAULT 'MT',
    origin_country TEXT,
    corridor TEXT,
    source TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_commodity ON public.price_history(commodity, recorded_at DESC);

-- Compliance Screenings (Phase 12)
CREATE TABLE public.compliance_screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID, -- user or company
    subject_type TEXT NOT NULL, -- 'user' | 'company'
    screening_type TEXT NOT NULL,
    match_found BOOLEAN DEFAULT false,
    match_details JSONB,
    screened_by TEXT DEFAULT 'system',
    screened_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freight / Routes (Phase 10)
CREATE TABLE public.freight_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_port TEXT,
    destination_port TEXT,
    corridor TEXT,
    estimated_days INTEGER,
    average_rate_per_mt NUMERIC,
    carrier TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Add company foreign keys where possible
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
