import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface Opportunity {
  id: string;
  product_name?: string;
  product?: string;
  score?: number;
  price?: number;
  origin_country?: string;
  export_country?: string;
}

interface PreDeal {
  id: string;
  status: string;
  product?: string;
}

interface UserData {
  name?: string;
  full_name?: string;
  tier?: string;
  account_tier?: string;
  credits?: number;
  credits_balance?: number;
}

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState<UserData | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch user
        const userRes = await fetch('/api/user/me');
        const userJson = await userRes.json();
        const u = userJson.data || userJson;
        setUser({
          name: u.full_name || u.name || 'User',
          tier: u.account_tier || u.tier || 'silver',
          credits: u.credits_balance ?? u.credits ?? 28,
        });

        // Fetch opportunities
        const oppsRes = await fetch('/api/opportunities?limit=20');
        const oppsJson = await oppsRes.json();
        setOpps(oppsJson.data || []);

        // Fetch pre-deals
        const dealsRes = await fetch('/api/pre-deals?limit=10');
        const dealsJson = await dealsRes.json();
        setDeals(dealsJson.data || []);
      } catch (e) {
        console.error('Dashboard load error', e);
        // Demo fallback data
        setUser({ name: 'Khalid Al-Rashid', tier: 'silver', credits: 28 });
        setOpps([]);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayName = user?.name || 'User';
  const tier = (user?.tier || 'silver').toUpperCase();
  const credits = user?.credits ?? 28;

  const pendingDeals = deals.filter(d => d.status === 'pending').length;

  if (loading) {
    return (
      <div>
        <AppHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Dashboard</h1>
            <p>Welcome back, {displayName}</p>
          </div>
          <div className="text-right text-sm">
            <div>Tier: <span className="font-semibold">{tier}</span></div>
            <div className="text-gold">{credits} credits remaining</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Opportunities Matched', val: opps.length },
            { label: 'Active Pre-Deals', val: pendingDeals },
            { label: 'Credits Used (mo)', val: '12' },
            { label: 'Deals Closed', val: '7' },
          ].map((s, i) => (
            <Card key={i}><CardContent className="pt-5"><div className="text-sm text-muted-foreground">{s.label}</div><div className="text-4xl font-bold mt-1">{s.val}</div></CardContent></Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Recent Opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {opps.slice(0, 4).map(o => <div key={o.id} className="flex justify-between border-b py-1.5 last:border-none"><span>{o.product_name || o.product}</span><span className="text-gold">{o.score ?? '-'}</span></div>)}
              {opps.length === 0 && <div className="text-muted-foreground text-xs">No opportunities yet. Data synced from production APIs.</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => toast('AI Agent launched')}>Run AI Sourcing Agent</Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast('New listing form opened')}>Post New Sell Offer</Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast('Smart Alert saved')}>Create Smart Alert</Button>
              <Button className="w-full justify-start" onClick={() => window.location.href = '/ai-agent'}>Ask AI Agent</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
