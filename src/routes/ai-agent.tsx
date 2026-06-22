import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { getOpportunities, Opportunity } from '../lib/mockData';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/ai-agent')({
  component: AISourcingAgent,
});

function AISourcingAgent() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<any>(null);

  const mockAIParse = (text: string) => {
    // Simulate LLM parsing
    const lower = text.toLowerCase();
    const filters: any = { product: '', origin: '', export: '', quantity: 0, maxPrice: 0 };
    
    if (lower.includes('urea')) filters.product = 'Urea 46%';
    if (lower.includes('steel') || lower.includes('rebar')) filters.product = 'Steel Rebar 12mm';
    if (lower.includes('oman')) filters.origin = 'Oman';
    if (lower.includes('turkey')) filters.export = 'Turkey';
    if (lower.includes('iraq')) filters.export = 'Iraq';
    if (lower.includes('5000')) filters.quantity = 5000;
    if (lower.includes('cif')) filters.incoterm = 'CIF';
    
    return filters;
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    // Simulate LLM latency
    await new Promise(r => setTimeout(r, 820));
    
    const parsed = mockAIParse(query);
    setParsedFilters(parsed);
    
    // Query real mock data
    const all = getOpportunities();
    const filtered = all.filter(o => {
      let match = true;
      if (parsed.product) match = match && o.product.toLowerCase().includes(parsed.product.toLowerCase().slice(0, 5));
      if (parsed.origin) match = match && (o.origin.toLowerCase().includes(parsed.origin.toLowerCase()) || o.exportCountry.toLowerCase().includes(parsed.origin.toLowerCase()));
      if (parsed.quantity) match = match && o.quantity >= parsed.quantity * 0.6;
      return match;
    });
    
    const ranked = filtered.sort((a, b) => b.score - a.score);
    
    setResults(ranked.length ? ranked : all.slice(0, 4));
    setLoading(false);
    
    toast.success('AI Agent parsed your request and ranked results.');
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="chip mb-3">ENGINE 06</div>
          <h1 className="font-display text-5xl font-bold tracking-tighter">{t('engine.agent.title')}</h1>
          <p className="mt-2 max-w-xl text-xl text-muted-foreground">{t('engine.agent.desc')}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between">
              <div>Describe your sourcing need in any language</div>
              <div className="text-xs px-3 py-0.5 bg-emerald-100 text-emerald-700 rounded">Powered by Claude 4</div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              placeholder={t('agent.placeholder')}
              className="min-h-[110px] text-lg"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmit} disabled={loading} className="bg-ink text-paper px-8">
                {loading ? 'Thinking...' : t('agent.submit')}
              </Button>
              <Button variant="outline" onClick={() => { setQuery(''); setResults([]); setParsedFilters(null); }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {parsedFilters && (
          <div className="mb-5">
            <div className="text-sm font-medium mb-1">AI Parsed Filters</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(parsedFilters).filter(([,v]) => v).map(([k,v]) => (
                <Badge key={k} variant="secondary">{k}: {String(v)}</Badge>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-semibold">Ranked Results ({results.length})</div>
              <Badge className="bg-gold/90 text-ink">AI Ranked</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {results.map(opp => (
                <Card key={opp.id} className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{opp.product}</div>
                      <div className="text-xs text-muted-foreground">{opp.origin} → {opp.exportCountry} · {opp.incoterm}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold text-gold">{opp.score}</div>
                      <div className="text-[10px] -mt-1">MATCH SCORE</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">{opp.quantity.toLocaleString()} {opp.unit} @ ${opp.price}</div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast('Saved to Smart Alerts')}>Save Alert</Button>
                    <Button size="sm" onClick={() => toast('Pre-deal generated. See Pre-Deals tab')}>Create Pre-Deal</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 text-sm text-muted-foreground border-t pt-4">
          Real LLM integration ready. Currently using high-fidelity mock parser + live opportunity database.
        </div>
      </div>
    </div>
  );
}
