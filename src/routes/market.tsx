import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getMarketSignals, MarketSignal } from '../lib/mockData';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/market')({
  component: MarketIntelligence,
});

function MarketIntelligence() {
  const { t } = useI18n();
  const signals = getMarketSignals();

  return (
    <div>
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="chip">ENGINE 05</div>
          <h1 className="font-display text-5xl font-extrabold">{t('engine.market.title')}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{t('engine.market.desc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {signals.map((sig, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  {sig.commodity}
                  <Badge variant={sig.priceTrend > 0 ? 'default' : 'secondary'}>{sig.priceTrend > 0 ? '+' : ''}{sig.priceTrend}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between"><span>Corridor</span><span className="font-medium">{sig.corridor}</span></div>
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Demand Index</span> <span>{sig.demandIndex}</span>
                    </div>
                    <div className="h-2 bg-muted rounded"><div className="h-2 bg-emerald-600 rounded" style={{width: sig.demandIndex + '%'}} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Supply Index</span> <span>{sig.supplyIndex}</span>
                    </div>
                    <div className="h-2 bg-muted rounded"><div className="h-2 bg-amber-500 rounded" style={{width: sig.supplyIndex + '%'}} /></div>
                  </div>
                  <Button size="sm" className="w-full mt-2" variant="outline" onClick={() => toast('Report downloaded (demo)')}>Download Corridor Report</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader><CardTitle>Live Price Trends</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {['Urea', 'Steel Rebar', 'Cement OPC', 'Base Oil'].map((c, i) => (
                <div key={i} className="border-l pl-4">
                  <div>{c}</div>
                  <div className="font-mono text-3xl font-bold mt-1">$ {Math.floor(300 + Math.random()*700)}</div>
                  <div className="text-xs text-emerald-600">+{Math.floor(Math.random()*9)+2}% MoM</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
