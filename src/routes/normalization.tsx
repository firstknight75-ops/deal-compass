import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

interface NormalizedRecord {
  product?: string;
  product_name?: string;
  originCountry?: string;
  origin_country?: string;
  exportCountry?: string;
  export_country?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  incoterm?: string;
  verificationStatus?: string;
  sourceUrl?: string;
}

export const Route = createFileRoute('/normalization')({
  component: NormalizationEngine,
});

function NormalizationEngine() {
  const { t } = useI18n();
  const [processing, setProcessing] = useState(false);
  const [normalized, setNormalized] = useState<NormalizedRecord[]>([]);

  const loadNormalized = async () => {
    try {
      const res = await fetch('/api/normalization');
      const json = await res.json();
      setNormalized(json.data || []);
    } catch {
      setNormalized([]);
    }
  };

  useEffect(() => {
    loadNormalized();
  }, []);

  const runNormalizationBatch = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/normalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawRecords: [] }), // server can pull recent
      });
      const json = await res.json();
      if (json.recent) setNormalized(json.recent);
      else await loadNormalized();
      toast.success(`Normalized batch completed.`);
    } catch {
      toast.error('Normalization failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="chip mb-2">ENGINE 02 — AI NORMALIZATION</div>
          <h1 className="font-display text-5xl font-extrabold tracking-tighter">AI Normalization</h1>
          <p className="mt-2 max-w-3xl text-xl text-muted-foreground">
            Raw crawl output → cleaned, translated to 5 languages, standardized units, structured fields.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle>Normalization Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>✓ Remove duplicates</div>
              <div>✓ Translate to English, Arabic, Farsi, Kurdish, Turkish</div>
              <div>✓ Standardize units (MT, CBM, etc.)</div>
              <div>✓ Extract: product, category, origin/export, quantity, price, incoterm</div>
              <div>✓ Output uniform record ready for scoring</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Run Batch</CardTitle></CardHeader>
            <CardContent>
              <Button 
                onClick={runNormalizationBatch} 
                disabled={processing}
                className="w-full"
              >
                {processing ? 'Normalizing raw crawl output...' : 'Process Latest Raw Crawl Data'}
              </Button>
              <div className="text-xs text-muted-foreground mt-3">
                Post-crawl processing step (as specified in SRS)
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Normalized Records ({normalized.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {normalized.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Run normalization batch to see records.</div>
            ) : (
              <div className="space-y-4">
                {normalized.map((rec, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-none">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{rec.product}</div>
                        <div className="text-xs text-muted-foreground">
                          {rec.originCountry} → {rec.exportCountry} • {rec.incoterm}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{rec.verificationStatus}</Badge>
                        <div className="text-[10px] mt-0.5 text-muted-foreground">{rec.unit}</div>
                      </div>
                    </div>
                    <div className="mt-1 text-sm">
                      {(rec.quantity ?? 0).toLocaleString()} {rec.unit} @ ${rec.price}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 truncate">
                      {rec.sourceUrl}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-xs text-muted-foreground">
          This implements the exact SRS description of Engine 2. Real version would use LLM (Anthropic/Claude) for extraction + translation.
        </div>
      </div>
    </div>
  );
}
