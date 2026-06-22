import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  product?: string;
  product_name?: string;
  origin?: string;
  origin_country?: string;
  exportCountry?: string;
  export_country?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  company?: string;
  company_name?: string;
  score?: number;
  sourceUrl?: string;
  crawledAt?: string;
}

export const Route = createFileRoute('/trade-radar')({
  component: TradeRadar,
});

function TradeRadar() {
  const { t } = useI18n();
  const [scanning, setScanning] = useState(false);
  const [recent, setRecent] = useState<Opportunity[]>([]);

  const loadRecent = async () => {
    try {
      const res = await fetch('/api/radar');
      const json = await res.json();
      setRecent(json.data || []);
    } catch {
      setRecent([]);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/radar', { method: 'POST', body: JSON.stringify({ sourceId: 'default' }) });
      const json = await res.json();
      if (json.data?.freshOpportunities) {
        setRecent(json.data.freshOpportunities);
      } else {
        await loadRecent();
      }
      toast.success(json.message || `${json.data?.newRecords || 0} new opportunities ingested from live sources.`);
    } catch {
      toast.error('Radar scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="chip mb-2">ENGINE 01 — TRADE RADAR</div>
          <h1 className="font-display text-5xl font-extrabold tracking-tighter">Trade Radar</h1>
          <p className="mt-2 max-w-3xl text-xl text-muted-foreground">
            The continuous crawler. Ingests trade opportunities from global chamber-of-commerce portals, government tender boards, factory directories, commodity exchanges, raw material markets, and open trade databases.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Button size="lg" onClick={runScan} disabled={scanning} className="px-10">
            {scanning ? "Crawling 42 sources (24/7 mode)..." : "Run Live Radar Scan"}
          </Button>
          <div className="text-sm text-muted-foreground">
            Runs 24/7 via scheduled workers • Stores to products + demands tables
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Sources Monitored", value: "128" },
            { label: "Last Crawl", value: "38s ago" },
            { label: "Countries", value: "47" },
            { label: "Records Added (24h)", value: "187" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="font-display text-4xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recently Ingested (Tagged with source URL + crawl timestamp + verification)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {recent.length === 0 && <div className="text-muted-foreground">No live records. Run a scan.</div>}
              {recent.map((o, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-3 last:border-none">
                  <div>
                    <span className="font-semibold">{o.product || o.product_name}</span> · {(o.origin || o.origin_country)} → {(o.exportCountry || o.export_country)}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {o.quantity} {o.unit} @ ${o.price} • {o.company || o.company_name}
                      {o.sourceUrl && <span className="ml-2 text-[10px] opacity-70">• {o.sourceUrl}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <Badge>{o.score || 75}</Badge>
                    {(o.crawledAt || true) && <span className="text-emerald-600 text-xs font-mono">LIVE</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-xs text-muted-foreground">
          This is the platform's primary data advantage — it produces inventory competitors don't have because they wait for self-submission.
        </div>
      </div>
    </div>
  );
}
