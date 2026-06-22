-- Production-grade RLS, Security, Idempotency, and Constraints

-- Idempotency keys table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    result JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_idempotency_expires ON public.idempotency_keys(expires_at);

-- Enable RLS on critical tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: own data only
DROP POLICY IF EXISTS "Users own profile" ON public.users;
CREATE POLICY "Users own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

-- Products: public read for active
DROP POLICY IF EXISTS "Public active opportunities" ON public.products;
CREATE POLICY "Public active opportunities" ON public.products
    FOR SELECT USING (is_active = true);

-- Pre-deals: only involved parties
DROP POLICY IF EXISTS "Pre-deal participants" ON public.pre_deals;
CREATE POLICY "Pre-deal participants" ON public.pre_deals
    FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Notifications: own only
DROP POLICY IF EXISTS "Own notifications" ON public.notifications;
CREATE POLICY "Own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Credits: own only
DROP POLICY IF EXISTS "Own credits txns" ON public.credits_transactions;
CREATE POLICY "Own credits txns" ON public.credits_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Admin / Compliance access
CREATE POLICY "Admins full access" ON public.products
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'compliance_officer')
    ));

CREATE POLICY "Admins and compliance can read screenings" ON public.compliance_screenings
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'compliance_officer')
    ));

-- Audit logs — admins only
DROP POLICY IF EXISTS "Admins only audit" ON public.audit_logs;
CREATE POLICY "Admins only audit" ON public.audit_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'compliance_officer')
    ));
