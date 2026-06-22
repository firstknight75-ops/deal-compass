-- DealCompass AI+ Production Schema
-- Phase 1 + Core Tables (2026-06-22)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('user', 'compliance_officer', 'admin', 'enterprise_admin');
CREATE TYPE account_tier AS ENUM ('free', 'bronze', 'silver', 'gold', 'platinum', 'black');
CREATE TYPE kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
CREATE TYPE opportunity_type AS ENUM ('sell', 'buy', 'tender', 'surplus', 'contract');
CREATE TYPE pre_deal_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');
CREATE TYPE payment_method AS ENUM ('escrow', 'letter_of_credit', 'documentary_collection', 'invoice_financing');
CREATE TYPE screening_type AS ENUM ('sanctions', 'pep', 'ubo', 'adverse_media');

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    country TEXT,
    role user_role NOT NULL DEFAULT 'user',
    account_tier account_tier NOT NULL DEFAULT 'free',
    credits_balance INTEGER NOT NULL DEFAULT 0,
    kyc_status kyc_status NOT NULL DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT false,
    reputation_score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (Enterprise)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT,
    website TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE public.organization_members (
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (organization_id, user_id)
);

-- ============================================
-- TRADE RADAR + OPPORTUNITIES (Engine 1 + 3)
-- ============================================

CREATE TABLE public.crawl_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL,
    reliability_score NUMERIC(5,2) DEFAULT 70.0,
    is_active BOOLEAN DEFAULT true,
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES public.crawl_sources(id),
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    records_found INTEGER DEFAULT 0,
    records_new INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.raw_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crawl_job_id UUID REFERENCES public.crawl_jobs(id),
    source_url TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    raw_content TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type opportunity_type NOT NULL,
    product_name TEXT NOT NULL,
    specification TEXT,
    category TEXT,
    quantity NUMERIC,
    unit TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'USD',
    origin_country TEXT,
    export_country TEXT,
    incoterm TEXT,
    company_name TEXT,
    company_id UUID,
    source_url TEXT,
    crawl_source_id UUID REFERENCES public.crawl_sources(id),
    score NUMERIC(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized records (Engine 2)
CREATE TABLE public.normalized_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_document_id UUID REFERENCES public.raw_documents(id),
    product_name TEXT,
    specification TEXT,
    category TEXT,
    quantity NUMERIC,
    unit TEXT,
    price NUMERIC,
    currency TEXT,
    origin_country TEXT,
    export_country TEXT,
    incoterm TEXT,
    confidence_score NUMERIC(5,2),
    normalized_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Scores (Engine 3)
CREATE TABLE public.opportunity_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    total_score NUMERIC(5,2) NOT NULL,
    field_completeness NUMERIC(5,2),
    source_reliability NUMERIC(5,2),
    data_freshness NUMERIC(5,2),
    cross_source_confirmation NUMERIC(5,2),
    explanation TEXT,
    scored_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANY INTELLIGENCE (Engine 4)
-- ============================================

CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT,
    country TEXT,
    website_verified BOOLEAN DEFAULT false,
    estimated_size TEXT,
    trade_volume_estimate NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.company_profiles (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id),
    activity_tier TEXT,
    response_rate_percentile NUMERIC,
    close_probability NUMERIC,
    fraud_probability NUMERIC,
    last_enriched_at TIMESTAMPTZ
);

-- ============================================
-- PRE-DEALS + MATCHING (Engine 8)
-- ============================================

CREATE TABLE public.pre_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supply_opportunity_id UUID REFERENCES public.products(id),
    demand_opportunity_id UUID REFERENCES public.products(id),
    suggested_price NUMERIC,
    suggested_quantity NUMERIC,
    match_score NUMERIC(5,2),
    payment_recommendation TEXT,
    status pre_deal_status DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKET INTELLIGENCE (Engine 5 + 9)
-- ============================================

CREATE TABLE public.commodity_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    unit TEXT DEFAULT 'MT',
    origin_country TEXT,
    corridor TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.market_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT,
    demand_index NUMERIC,
    supply_index NUMERIC,
    price_trend NUMERIC,
    corridor TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRADE FINANCE (Phase 11)
-- ============================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pre_deal_id UUID REFERENCES public.pre_deals(id),
    buyer_id UUID REFERENCES public.users(id),
    seller_id UUID REFERENCES public.users(id),
    total_value NUMERIC,
    currency TEXT,
    status TEXT DEFAULT 'pending',
    payment_method payment_method,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.letters_of_credit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id),
    lc_number TEXT,
    issuing_bank TEXT,
    amount NUMERIC,
    currency TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPLIANCE (Phase 12)
-- ============================================

CREATE TABLE public.screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    type screening_type,
    match_found BOOLEAN DEFAULT false,
    details JSONB,
    screened_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREDITS & BILLING
-- ============================================

CREATE TABLE public.credits_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'spend', 'purchase', 'monthly_allocation'
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS (Phase 14)
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_score ON public.products(score DESC);
CREATE INDEX idx_products_origin_export ON public.products(origin_country, export_country);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX idx_opportunity_scores_total ON public.opportunity_scores(total_score DESC);
CREATE INDEX idx_commodity_prices_commodity ON public.commodity_prices(commodity, recorded_at DESC);
CREATE INDEX idx_pre_deals_status ON public.pre_deals(status, expires_at);

-- ============================================
-- RLS POLICIES (Basic)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public can view active opportunities" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can see their pre-deals" ON public.pre_deals
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
