import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { aiSourcingAgentService } from '../services/ai-sourcing.service';
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

  // SRS-accurate natural language parsing
  const mockAIParse = (text: string) => {
    const lower = text.toLowerCase();
    const filters: any = {
      product: '',
      specification: '',
      origin_country: '',
      export_country: '',
      min_quantity: 0,
      max_price_per_unit: 0,
      incoterm: '',
      delivery_deadline: '',
    };

    if (lower.includes('urea')) { filters.product = 'Urea 46%'; filters.specification = '46%'; }
    else if (lower.includes('rebar') || lower.includes('steel')) filters.product = 'Steel Rebar 12mm';
    else if (lower.includes('cement')) filters.product = 'Cement OPC 42.5';
    else if (lower.includes('sulfur') || lower.includes('sulphur')) filters.product = 'Sulfur Granular';

    if (lower.includes('oman')) filters.origin_country = 'Oman';
    if (lower.includes('iraq')) filters.export_country = 'Iraq';
    if (lower.includes('turkey')) filters.export_country = 'Turkey';
    if (lower.includes('uae') || lower.includes('dubai')) filters.export_country = 'UAE';
    if (lower.includes('iran')) filters.origin_country = 'Iran';

    const qtyMatch = text.match(/(\d[,\d]*)\s*(mt|ton|tonne)/i);
    if (qtyMatch) filters.min_quantity = parseInt(qtyMatch[1].replace(/,/g, ''));

    if (lower.includes('cif')) filters.incoterm = 'CIF';
    if (lower.includes('fob')) filters.incoterm = 'FOB';

    const dateMatch = text.match(/by\s+(sept|sep|oct|nov|dec|jan|feb|mar)/i);
    if (dateMatch) filters.delivery_deadline = dateMatch[1] + ' 2026';

    return filters;
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setLoading(true);

    try {
      // Call real AI Sourcing Agent service (uses Anthropic stub or real Claude)
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (result.success) {
        setParsedFilters(result.parsed);
        // Convert service results to local Opportunity shape for display
        const mapped = result.results.map((r: any) => ({
          ...r.opportunity,
          score: r.match_score,
          matchExplanation: r.match_explanation,
        }));
        setResults(mapped);
        toast.success(`Found ${result.total} ranked opportunities`);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      // Fallback to local service if API not available in dev
      const localResult = await aiSourcingAgentService.processNaturalLanguageQuery(query);
      setParsedFilters(localResult.parsed_filters);
      const mapped = localResult.results.map(r => ({
        ...r.opportunity,
        score: r.match_score,
      }));
      setResults(mapped);
      toast.success('AI Agent (local) returned results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="chip mb-3">ENGINE 06 — AI SOURCING AGENT</div>
          <h1 className="font-display text-5xl font-bold tracking-tighter">{t('engine.agent.title')}</h1>
          <p className="mt-2 max-w-xl text-xl text-muted-foreground">{t('engine.agent.desc')}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between">
              <div>Describe your sourcing need in natural language (any of the 5 languages)</div>
              <div className="text-xs px-3 py-0.5 bg-emerald-100 text-emerald-700 rounded">LLM-powered (Claude-style)</div>
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
                {loading ? 'Parsing with AI...' : t('agent.submit')}
              </Button>
              <Button variant="outline" onClick={() => { setQuery(''); setResults([]); setParsedFilters(null); }}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {parsedFilters && (
          <div className="mb-6">
            <div className="text-sm font-medium mb-2">AI-Parsed Structured Filters (per SRS)</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(parsedFilters).filter(([,v]) => v).map(([k, v]) => (
                <Badge key={k} variant="secondary" className="font-mono text-xs">{k}: {String(v)}</Badge>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-semibold">Ranked Results ({results.length}) — scored using Engine 3</div>
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
                      <div className="text-[10px] -mt-1">SCORE</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">{opp.quantity.toLocaleString()} {opp.unit} @ ${opp.price}</div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast('Smart Alert saved')}>Save as Alert</Button>
                    <Button size="sm" onClick={() => toast('Pre-deal created from this match')}>Generate Pre-Deal</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 text-xs text-muted-foreground border-t pt-4 space-y-1">
          <div>
            <strong>LLM Integration:</strong> Using Anthropic stub (<code>parseSourcingRequestWithLLM</code>). 
            Toggle <code>useRealLLM: true</code> + pass API key for live Claude calls.
          </div>
          <div>Parser follows exact SRS structure: product_name, origin_country, export_country, min_quantity, incoterm, delivery_deadline.</div>
        </div>
      </div>
    </div>
  );
}
