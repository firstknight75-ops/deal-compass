import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getOpportunities } from '../lib/mockData';
import { getAdvancedMarketSignals } from '../lib/mockData';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/market')({
  component: MarketIntelligence,
});

function MarketIntelligence() {
  const { t } = useI18n();
  const opps = getOpportunities();
  const advancedSignals = getAdvancedMarketSignals();

  return (
    <div>
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="chip">ENGINE 05 — MARKET INTELLIGENCE</div>
          <h1 className="font-display text-5xl font-extrabold tracking-tighter">{t('engine.market.title')}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{t('engine.market.desc')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {advancedSignals.map((sig, idx) => (
            <Card key={idx} className={sig.surplus ? 'border-amber-400' : ''}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {sig.commodity}
                  <Badge variant={Number(sig.priceTrend) > 0 ? 'default' : 'secondary'}>
                    {Number(sig.priceTrend) > 0 ? '+' : ''}{sig.priceTrend}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span>Corridor</span>
                  <span className="font-medium text-right">{sig.corridor}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Avg Price</span>
                  <span className="font-mono font-semibold">${sig.avgPrice}</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Demand Index</span> <span>{sig.demandIndex}</span>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div className="h-2 bg-emerald-600 rounded" style={{width: sig.demandIndex + '%'}} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Supply Index</span> <span>{sig.supplyIndex}</span>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div className="h-2 bg-amber-500 rounded" style={{width: sig.supplyIndex + '%'}} />
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span>Records: <strong>{sig.count}</strong></span>
                  {sig.surplus && <span className="text-amber-600 font-medium">SUPPLY SURPLUS</span>}
                </div>

                <Button 
                  size="sm" 
                  className="w-full mt-1" 
                  variant="outline" 
                  onClick={() => toast(`Downloaded ${sig.commodity} corridor report (Gold+ feature)`)}
                >
                  Download Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Top Active Opportunities (live feed)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {opps.slice(0, 6).map((o, i) => (
                <div key={i} className="flex justify-between py-1 border-b last:border-none">
                  <span>{o.product} • {o.origin} → {o.exportCountry}</span>
                  <span className="font-mono text-right">${o.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-xs text-muted-foreground">
          Engine 5 aggregates crawled + transacted data. Gold/Black tier only in production.
        </div>
      </div>
    </div>
  );
}
