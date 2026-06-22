-- Phase 1: Backend Foundation - Atomic Functions & Core Services
-- Run after 001_initial_schema.sql

-- ============================================
-- ATOMIC CREDITS FUNCTIONS (Production Grade)
-- ============================================

CREATE OR REPLACE FUNCTION spend_credits_atomic(
    p_user_id UUID,
    p_amount INTEGER,
    p_reference_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Lock the row
    SELECT credits_balance INTO current_balance
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;

    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    -- Deduct
    UPDATE public.users
    SET credits_balance = credits_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log transaction
    INSERT INTO public.credits_transactions (user_id, amount, type, reference_id, metadata)
    VALUES (p_user_id, -p_amount, 'spend', p_reference_id, p_metadata);

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET credits_balance = credits_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.credits_transactions (user_id, amount, type, reference_id)
    VALUES (p_user_id, p_amount, p_type, p_reference_id);
END;
$$;

-- Monthly allocation (called by cron)
CREATE OR REPLACE FUNCTION allocate_monthly_credits()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    allocated_count INTEGER := 0;
    tier_credits RECORD;
BEGIN
    FOR tier_credits IN
        SELECT id, 
               CASE account_tier
                   WHEN 'bronze' THEN 10
                   WHEN 'silver' THEN 30
                   WHEN 'gold' THEN 100
                   WHEN 'platinum' THEN 9999
                   ELSE 0
               END as allocation
        FROM public.users
        WHERE account_tier != 'free'
    LOOP
        PERFORM add_credits(
            tier_credits.id,
            tier_credits.allocation,
            'monthly_allocation'
        );
        allocated_count := allocated_count + 1;
    END LOOP;

    RETURN allocated_count;
END;
$$;

-- ============================================
-- USER & RBAC HELPERS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql STABLE
AS $$
    SELECT role FROM public.users WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION is_admin_or_compliance(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT role IN ('admin', 'compliance_officer', 'enterprise_admin')
    FROM public.users WHERE id = user_id;
$$;

-- ============================================
-- AUDIT LOG TABLE (Phase 1)
-- ============================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- RLS for audit
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read audit logs" ON public.audit_logs
    FOR SELECT USING (is_admin_or_compliance(auth.uid()));

-- ============================================
-- NOTIFICATION RULES (Phase 1 foundation)
-- ============================================

CREATE TABLE public.notification_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    conditions JSONB NOT NULL,
    channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA (Minimal, for dev only — remove in prod)
-- ============================================

-- This is the ONLY place we allow limited seed data for development
-- Production will use real crawlers and user onboarding
INSERT INTO public.crawl_sources (name, url, source_type, reliability_score) VALUES
('Iraq Ministry of Trade', 'https://trade.gov.iq/tenders', 'government', 95.0),
('Baghdad Chamber', 'https://baghdad-chamber.iq', 'chamber', 88.0),
('Dubai Commodities', 'https://dmcc.ae', 'exchange', 92.0),
('Turkey Exporters', 'https://tim.org.tr', 'chamber', 90.0)
ON CONFLICT (url) DO NOTHING;
