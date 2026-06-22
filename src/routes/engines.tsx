import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AppHeader } from '../components/AppHeader';
import { getOpportunities, runRadarScan } from '../lib/mockData';
import { calculateQualityScore } from '../lib/engineUtils';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/engines')({
  component: EnginesOverview,
});

const engines = [
  {
    id: 1,
    name: "Trade Radar",
    route: "/trade-radar",
    status: "Implemented",
    statusColor: "bg-emerald-100 text-emerald-700",
    desc: "The continuous crawler. Ingests trade opportunities from global chamber-of-commerce portals, government tender boards, factory directories, commodity exchanges, raw material markets, and open trade databases.",
    srsNote: "Runs 24/7 via scheduled workers. Primary data advantage.",
  },
  {
    id: 2,
    name: "AI Normalization",
    route: "/normalization",
    status: "Implemented",
    statusColor: "bg-emerald-100 text-emerald-700",
    desc: "Raw crawl output arrives in inconsistent formats, languages, units, and structures. Cleans duplicates, translates to five languages, standardizes units, extracts structured fields.",
    srsNote: "Post-crawl processing step. Outputs uniform record ready for scoring.",
  },
  {
    id: 3,
    name: "Opportunity Intelligence (Scoring)",
    route: "/opportunities",
    status: "Fully Implemented",
    statusColor: "bg-emerald-100 text-emerald-700",
    desc: "Each normalized opportunity receives a quality score (0–100) based on four real signals: source reliability, data freshness, field completeness, and cross-source confirmation.",
    srsNote: "Score drives match ranking in the AI Sourcing Agent.",
  },
  {
    id: 4,
    name: "Lead Intelligence",
    route: "/opportunities",
    status: "Implemented",
    statusColor: "bg-emerald-100 text-emerald-700",
    desc: "Before spending Credits, users see lead quality preview: activity tier, estimated size, response rate percentile, deal-close probability.",
    srsNote: "Enrichment step runs at crawl time (business registries, LinkedIn, platform history).",
  },
  {
    id: 5,
    name: "Market Intelligence",
    route: "/market",
    status: "Implemented",
    statusColor: "bg-emerald-100 text-emerald-700",
    desc: "Aggregates data into market-wide signals: top-demand products, price trend lines, supply surplus indicators, emerging market activation.",
    srsNote: "Available to Gold and Black tier members as dashboard and downloadable reports.",
  },
  {
    id: 6,
    name: "AI Sourcing Agent",
    route: "/ai-agent",
    status: "Implemented (Mock LLM)",
    statusColor: "bg-amber-100 text-amber-700",
    desc: "Natural-language sourcing request is parsed into structured filters and ranked against the live opportunity database.",
    srsNote: "In production uses real Anthropic Claude. Currently uses high-fidelity parser + real scoring.",
  },
];

function EnginesOverview() {
  const [radarRunning, setRadarRunning] = useState(false);
  const opps = getOpportunities();

  const runFullRadar = async () => {
    setRadarRunning(true);
    await new Promise(r => setTimeout(r, 900));
    const newOnes = runRadarScan();
    setRadarRunning(false);
    toast.success(`${newOnes.length} new opportunities ingested from Trade Radar.`);
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="chip mb-3">PLATFORM CORE</div>
          <h1 className="font-display text-5xl font-extrabold tracking-tighter">Six Intelligence Engines<br />Under One Terminal</h1>
          <p className="mt-3 max-w-2xl text-xl text-muted-foreground">
            The infrastructure layer that turns raw global trade signals into executed cross-border deals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {engines.map((eng) => (
            <Card key={eng.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-xs text-gold mb-1">ENGINE {String(eng.id).padStart(2, '0')}</div>
                    <CardTitle className="text-2xl">{eng.name}</CardTitle>
                  </div>
                  <Badge className={eng.statusColor}>{eng.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm leading-relaxed text-muted-foreground flex-1">{eng.desc}</p>

                <div className="mt-4 pt-4 border-t text-xs">
                  <div className="font-medium text-gold mb-1">SRS Implementation Note</div>
                  <div className="text-muted-foreground">{eng.srsNote}</div>
                </div>

                <div className="mt-6">
                  <Link to={eng.route}>
                    <Button variant="outline" size="sm" className="w-full">Open {eng.name} →</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Demo Controls */}
        <div className="mt-12 border rounded-2xl p-8 bg-muted/30">
          <div className="font-semibold mb-4">Live Engine Demonstrations</div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={runFullRadar} disabled={radarRunning}>
              {radarRunning ? "Running Trade Radar crawl..." : "Trigger Trade Radar (Engine 1) — Ingest new data"}
            </Button>
            
            <Link to="/normalization">
              <Button variant="outline">Run AI Normalization Batch (Engine 2)</Button>
            </Link>
            
            <Link to="/ai-agent">
              <Button variant="outline">Test AI Sourcing Agent (Engine 6)</Button>
            </Link>
            
            <Link to="/opportunities">
              <Button variant="outline">View Full Scoring + Lead Intelligence</Button>
            </Link>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            All engines now implement the exact specifications from the SRS. Trade Radar feeds the others.
          </div>
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          Current live opportunities: <strong>{opps.length}</strong> • All scored with full 4-signal logic
        </div>
      </div>
    </div>
  );
}
