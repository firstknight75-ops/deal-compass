import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/billing')({
  component: BillingPage,
});

interface Tier {
  name: string;
  price: number;
  credits: number;
  features: string[];
}

interface PlanData {
  tier: string;
  credits: number;
  tiers?: Tier[];
}

function BillingPage() {
  const { t } = useI18n();
  const [plan, setPlan] = useState<PlanData>({ tier: 'free', credits: 0 });
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);

  // Load real data from API (includes tiers + current plan)
  const loadPlan = async () => {
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data: PlanData = await res.json();
        setPlan(data);
        if (data.tiers && data.tiers.length > 0) {
          setTiers(data.tiers);
        }
      }
    } catch (e) {
      console.error('[Billing] Failed to load plan', e);
      // Fallback tiers (only if API fails - for offline resilience)
      if (tiers.length === 0) {
        setTiers([
          { name: 'Bronze', price: 49, credits: 10, features: ['Opportunity scores', 'Basic alerts'] },
          { name: 'Silver', price: 149, credits: 30, features: ['Pre-deals', 'AI Agent basic'] },
          { name: 'Gold', price: 349, credits: 100, features: ['Market Intelligence', 'Priority matching'] },
          { name: 'Platinum', price: 749, credits: 9999, features: ['Unlimited credits', 'Advanced AI', 'Dedicated manager'] },
        ]);
      }
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const upgrade = async (tier: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade', tier }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Upgraded to ${tier}!`);
        await loadPlan();
      } else {
        toast.error(result.error || 'Upgrade failed');
      }
    } catch (err) {
      toast.error('Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  const buyCredits = async (amt: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase_credits', amount: amt }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`+${amt} credits purchased`);
        await loadPlan();
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (err) {
      toast.error('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (tier: string) => {
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_checkout', tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Checkout failed. Ensure Stripe key is configured.');
    }
  };

  const currentTiers = tiers.length > 0 ? tiers : [];

  return (
    <div>
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl font-bold mb-8">Billing &amp; Credits</h1>

        <div className="mb-8">
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <div>Current Plan: <span className="font-semibold text-xl">{plan.tier.toUpperCase()}</span></div>
                <div className="text-gold text-3xl font-bold mt-1">{plan.credits} Credits</div>
              </div>
              <div>
                <Button onClick={() => buyCredits(25)} disabled={loading}>Buy 25 Credits ($29)</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentTiers.map((t, idx) => (
            <Card key={idx} className={plan.tier === t.name.toLowerCase() ? 'border-gold' : ''}>
              <CardHeader>
                <CardTitle>{t.name} — ${t.price}/mo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{t.credits} credits/mo</div>
                  <ul className="mt-3 text-sm space-y-1 text-muted-foreground">
                    {t.features.map(f => <li key={f}>• {f}</li>)}
                  </ul>
                </div>
                <Button 
                  onClick={() => handleCheckout(t.name)} 
                  className="w-full" 
                  disabled={plan.tier === t.name.toLowerCase() || loading}
                >
                  {plan.tier === t.name.toLowerCase() ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-10">
          Payments processed securely via Stripe. Credits are non-refundable. 
          {process.env.NODE_ENV !== 'production' && ' (Development mode: configure STRIPE_SECRET_KEY for live checkout)'}
        </div>
      </div>
    </div>
  );
}
