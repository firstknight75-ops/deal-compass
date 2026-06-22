import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { getOpportunities, unlockContact, addOpportunity, Opportunity, useCredits, getUser } from '../lib/mockData';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { toast } from 'sonner';

export const Route = createFileRoute('/opportunities')({
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { t } = useI18n();
  const [opps, setOpps] = useState(getOpportunities());
  const [filters, setFilters] = useState({ product: '', origin: '', type: 'all', minScore: 0 });
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const user = getUser();

  const filtered = opps.filter(o => {
    const matchesProduct = !filters.product || o.product.toLowerCase().includes(filters.product.toLowerCase());
    const matchesOrigin = !filters.origin || o.origin.toLowerCase().includes(filters.origin.toLowerCase()) || o.exportCountry.toLowerCase().includes(filters.origin.toLowerCase());
    const matchesType = filters.type === 'all' || o.type === filters.type;
    const matchesScore = o.score >= filters.minScore;
    return matchesProduct && matchesOrigin && matchesType && matchesScore;
  });

  function handleUnlock(id: string) {
    if (!useCredits(1)) {
      toast.error('Not enough credits. Upgrade or buy more.');
      return;
    }
    const updated = unlockContact(id);
    if (updated) {
      setUnlocked([...unlocked, id]);
      setOpps(getOpportunities());
      toast.success('Contact unlocked! 1 credit used.');
    }
  }

  function handleAddDemo() {
    const newOpp = addOpportunity({
      product: 'Phosphoric Acid 54%',
      quantity: 1800,
      price: 680,
      origin: 'Morocco',
      exportCountry: 'Turkey',
      category: 'Fertilizers'
    });
    setOpps(getOpportunities());
    toast.success('Demo opportunity added.');
  }

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
            return (
              <Card key={opp.id} className="hover:shadow-lg transition">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={opp.type === 'sell' ? 'default' : opp.type === 'buy' ? 'secondary' : 'outline'}>
                        {opp.type.toUpperCase()}
                      </Badge>
                      <div className="font-semibold text-xl mt-2">{opp.product}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl text-gold font-bold">{opp.score}</div>
                      <div className="text-xs -mt-1 text-muted-foreground">SCORE</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div><span className="text-muted-foreground">Quantity:</span> {opp.quantity.toLocaleString()} {opp.unit}</div>
                    <div><span className="text-muted-foreground">Price:</span> ${opp.price} / {opp.unit}</div>
                    <div><span className="text-muted-foreground">Origin:</span> {opp.origin}</div>
                    <div><span className="text-muted-foreground">Export via:</span> {opp.exportCountry}</div>
                    <div><span className="text-muted-foreground">Incoterm:</span> {opp.incoterm}</div>
                    <div><span className="text-muted-foreground">Age:</span> {opp.ageDays}d</div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t">
                    <div>
                      <div className="font-medium">{opp.company}</div>
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
        
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No opportunities match filters.</div>}
      </div>
    </div>
  );
}
