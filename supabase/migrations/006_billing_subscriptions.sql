-- Billing & Subscriptions Production Tables

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);

-- Add subscription foreign key to users for convenience
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id);

-- Function to sync subscription tier to user
CREATE OR REPLACE FUNCTION sync_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET account_tier = NEW.tier,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_subscription_tier_trigger
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION sync_subscription_tier();
