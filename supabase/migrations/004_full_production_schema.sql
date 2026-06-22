-- Full Production Schema - Remaining Phases
-- Knowledge Graph, Freight, Price Intelligence, Compliance, Enterprise

-- Trade Knowledge Graph (Phase 6)
CREATE TABLE IF NOT EXISTS public.trade_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_entity_id UUID NOT NULL,
    from_entity_type TEXT NOT NULL, -- company | contact
    to_entity_id UUID NOT NULL,
    to_entity_type TEXT NOT NULL,
    relationship_type TEXT NOT NULL, -- 'BUYER_OF', 'SUPPLIER_OF', 'SHIPPED_TO', etc.
    strength_score NUMERIC(5,2) DEFAULT 50.0,
    evidence_count INTEGER DEFAULT 1,
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_relationships_type ON public.trade_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_trade_relationships_from ON public.trade_relationships(from_entity_id, relationship_type);

-- Price Intelligence (Phase 9)
CREATE TABLE IF NOT EXISTS public.price_history (
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

CREATE INDEX IF NOT EXISTS idx_price_history_commodity ON public.price_history(commodity, recorded_at DESC);

-- Freight Intelligence (Phase 10)
CREATE TABLE IF NOT EXISTS public.freight_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin TEXT,
    destination TEXT,
    corridor TEXT,
    estimated_transit_days INTEGER,
    avg_rate_per_mt NUMERIC,
    carrier TEXT,
    reliability_score NUMERIC(5,2) DEFAULT 70,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance (Phase 12)
CREATE TABLE IF NOT EXISTS public.compliance_screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL,
    subject_type TEXT NOT NULL, -- 'user' | 'company'
    screening_type TEXT NOT NULL,
    match_found BOOLEAN DEFAULT false,
    match_details JSONB,
    risk_level TEXT,
    screened_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprise / Organizations (Phase 13)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (team_id, user_id)
);

-- Webhooks (Enterprise)
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id),
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add more indexes and constraints
CREATE INDEX IF NOT EXISTS idx_price_history_corridor ON public.price_history(corridor);
CREATE INDEX IF NOT EXISTS idx_screenings_subject ON public.compliance_screenings(subject_id, screened_at DESC);
