import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  type: string;
  product?: string;
  product_name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  currency?: string;
  origin?: string;
  origin_country?: string;
  exportCountry?: string;
  export_country?: string;
  incoterm?: string;
  score?: number;
  ageDays?: number;
  company?: string;
  company_name?: string;
  verified?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  sourceUrl?: string;
  leadQuality?: any;
  scoreBreakdown?: any;
}

export const Route = createFileRoute('/opportunities')({
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { t } = useI18n();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [filters, setFilters] = useState({ product: '', origin: '', type: 'all', minScore: 0 });
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [user, setUser] = useState<any>({ credits: 28, tier: 'silver' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [userRes, oppsRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/opportunities')
        ]);
        const u = await userRes.json();
        const o = await oppsRes.json();
        setUser(u.data || u);
        setOpps(o.data || []);
      } catch {
        setUser({ credits: 28, tier: 'silver' });
        setOpps([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = opps.filter(o => {
    const prod = (o.product || o.product_name || '').toLowerCase();
    const orig = (o.origin || o.origin_country || '').toLowerCase();
    const exp = (o.exportCountry || o.export_country || '').toLowerCase();
    const matchesProduct = !filters.product || prod.includes(filters.product.toLowerCase());
    const matchesOrigin = !filters.origin || orig.includes(filters.origin.toLowerCase()) || exp.includes(filters.origin.toLowerCase());
    const matchesType = filters.type === 'all' || o.type === filters.type;
    const score = o.score || 0;
    const matchesScore = score >= filters.minScore;
    return matchesProduct && matchesOrigin && matchesType && matchesScore;
  });

  const handleUnlock = async (id: string) => {
    try {
      const creditRes = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1, referenceId: 'unlock_' + id }),
      });
      if (!creditRes.ok) {
        const err = await creditRes.json().catch(() => ({}));
        toast.error(err.error || 'Not enough credits. Upgrade or buy more.');
        return;
      }
      // Refresh user
      const userRes = await fetch('/api/user/me');
      const u = await userRes.json();
      setUser(u.data || u);

      // For unlock, fetch full opp (contact reveal handled server-side or via separate call)
      const oppRes = await fetch(`/api/opportunities?product=&origin=&type=&minScore=0`); // could enhance to fetch single
      const oppData = await oppRes.json();
      setOpps(oppData.data || []);

      setUnlocked([...unlocked, id]);
      toast.success('Contact unlocked! 1 credit used.');
    } catch (e) {
      toast.error('Unlock failed');
    }
  };

  const handleAddDemo = async () => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: 'Phosphoric Acid 54%',
          quantity: 1800,
          price: 680,
          origin_country: 'Morocco',
          export_country: 'Turkey',
          category: 'Fertilizers',
          type: 'sell',
          unit: 'MT',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setOpps([json.data, ...opps]);
        toast.success('Demo opportunity added.');
      } else {
        toast.error('Failed to add listing');
      }
    } catch {
      toast.error('Add failed (demo)');
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">{t('nav.opportunities')}</h1>
            <p className="text-muted-foreground mt-1">Live Global Opportunity Wall — {filtered.length} opportunities</p>
          </div>
          <Button onClick={handleAddDemo} variant="outline">+ Add Demo Opportunity</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 bg-white p-4 border rounded-xl">
          <Input placeholder="Product name" className="max-w-[220px]" value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})} />
          <Input placeholder="Origin / Export country" className="max-w-[220px]" value={filters.origin} onChange={e => setFilters({...filters, origin: e.target.value})} />
          
          <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sell">Sell Offers</SelectItem>
              <SelectItem value="buy">Buy Requests</SelectItem>
              <SelectItem value="tender">Tenders</SelectItem>
              <SelectItem value="surplus">Surplus</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm">Min Score</span>
            <input type="range" min="50" max="100" value={filters.minScore} onChange={e => setFilters({...filters, minScore: +e.target.value})} className="accent-gold" />
            <span className="font-mono w-8 text-sm">{filters.minScore}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(opp => {
            const isUnlocked = unlocked.includes(opp.id);
            const product = opp.product_name || opp.product || 'Unknown';
            const origin = opp.origin_country || opp.origin || '';
            const exportC = opp.export_country || opp.exportCountry || '';
            const qty = opp.quantity || 0;
            const price = opp.price || 0;
            const unit = opp.unit || 'MT';
            const company = opp.company_name || opp.company || 'Unknown';
            const score = opp.score || 0;
            const age = opp.ageDays || 0;
            return (
              <Card key={opp.id} className="hover:shadow-lg transition">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={opp.type === 'sell' ? 'default' : opp.type === 'buy' ? 'secondary' : 'outline'}>
                        {opp.type?.toUpperCase()}
                      </Badge>
                      <div className="font-semibold text-xl mt-2">{product}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl text-gold font-bold">{score}</div>
                      <div className="text-xs -mt-1 text-muted-foreground">SCORE</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div><span className="text-muted-foreground">Quantity:</span> {qty.toLocaleString()} {unit}</div>
                    <div><span className="text-muted-foreground">Price:</span> ${price} / {unit}</div>
                    <div><span className="text-muted-foreground">Origin:</span> {origin}</div>
                    <div><span className="text-muted-foreground">Export via:</span> {exportC}</div>
                    <div><span className="text-muted-foreground">Incoterm:</span> {opp.incoterm}</div>
                    <div><span className="text-muted-foreground">Age:</span> {age}d</div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t">
                    <div>
                      <div className="font-medium">{company}</div>
                      <div className="text-xs text-muted-foreground">{opp.verified ? '✓ Verified' : 'Unverified'}</div>
                    </div>

                    {!isUnlocked && !opp.contactName ? (
                      <div className="text-right">
                        {/* Lead Intelligence Preview (Engine 4) */}
                        {opp.leadQuality && (
                          <div className="mb-1.5 text-[10px] text-right leading-tight text-muted-foreground">
                            {opp.leadQuality.activityTier} • {opp.leadQuality.closeProbability}% close prob.<br />
                            Response: {opp.leadQuality.responseRate}th percentile
                          </div>
                        )}
                        <Button size="sm" onClick={() => handleUnlock(opp.id)} className="bg-gold text-ink hover:bg-gold-dim">
                          {t('unlock')} <span className="text-xs ml-1">(1 credit)</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded font-medium">
                        {opp.contactName}<br />
                        {opp.contactPhone} · {opp.contactEmail}
                      </div>
                    )}
                  </div>

                  {/* Engine 3: Visual Score Breakdown */}
                  {opp.scoreBreakdown && (
                    <div className="mt-3 pt-3 border-t">
                      <ScoreBreakdown breakdown={opp.scoreBreakdown} compact={true} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {filtered.length === 0 && !loading && <div className="text-center py-12 text-muted-foreground">No opportunities match filters.</div>}
        {loading && <div className="text-center py-12 text-muted-foreground">Loading live opportunities...</div>}
      </div>
    </div>
  );
}
