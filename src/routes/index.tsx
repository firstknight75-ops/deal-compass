import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DealCompass AI+ — Global Trade Intelligence Terminal" },
      { 
        name: "description", 
        content: "DealCompass AI+ is not a marketplace. It is the trade intelligence terminal that turns raw global trade signals into executed cross-border deals across the Iraq–Iran–Turkey–EU corridor." 
      },
    ],
  }),
  component: Landing,
});

const engines = [
  { n: "01", title: "Trade Radar", body: "Continuous crawler scanning 40+ countries for tenders, directories, exchanges and raw trade signals." },
  { n: "02", title: "AI Normalization", body: "Raw multilingual data cleaned, translated and standardized into uniform, queryable opportunity records." },
  { n: "03", title: "Opportunity Scoring", body: "0–100 quality score based on field completeness, source reliability and data freshness." },
  { n: "04", title: "Lead Intelligence", body: "Verified decision-maker contacts, activity tier, sanctions preview and enrichment before reveal." },
  { n: "05", title: "Market Intelligence", body: "Live price trends, corridor heatmaps, supply/demand imbalances and actionable signals." },
  { n: "06", title: "AI Sourcing Agent", body: "Natural language request → parsed filters → ranked opportunities with match reasoning and pre-deals." },
];

function Landing() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="border-b bg-paper sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="h-3 w-3 rounded-full bg-gold inline-block" /> Deal<span className="text-gold">Compass</span> AI+
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="#positioning" className="hover:text-gold">Positioning</a>
              <a href="#engines" className="hover:text-gold">Engines</a>
              <Link to="/opportunities" className="hover:text-gold">Opportunities</Link>
              <Link to="/ai-agent" className="hover:text-gold">AI Agent</Link>
            </nav>
            <LanguageSwitcher />
            <Link to="/dashboard">
              <Button size="sm">Enter Platform</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 bg-ink text-paper">
        <div className="max-w-5xl mx-auto px-6">
          <div className="chip mb-4 inline-flex">2026 • Iraq • Iran • Turkey • EU Corridor</div>
          
          <h1 className="font-display text-6xl md:text-7xl font-extrabold tracking-tighter max-w-5xl">
            DealCompass AI+<br />is not a marketplace.
          </h1>
          <p className="mt-6 max-w-3xl text-2xl text-paper/80">
            It is a <span className="text-gold">trade intelligence terminal</span> — the infrastructure layer that turns raw global trade signals into executed cross-border deals.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gold text-ink px-9 text-base">Enter the Terminal</Button>
            </Link>
            <Link to="/ai-agent">
              <Button size="lg" variant="outline" className="border-paper/30 text-paper px-8">Try the AI Sourcing Agent</Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-paper/60">
            Discover a real, executable trade opportunity — fully scored, with verified counterparties and structured payment terms — within 5 minutes.
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="border-b bg-paper py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="callout border-l-4 border-gold bg-amber-50/60 p-6 rounded">
            <div className="uppercase tracking-[2px] text-xs font-semibold text-gold mb-3">Vision Statement</div>
            <p className="text-xl leading-tight text-ink">
              Any commodity trader, manufacturer, or logistics operator anywhere in the world should be able to discover a real, executable trade opportunity — fully scored, with verified counterparties and structured payment terms — <span className="font-semibold">within 5 minutes of opening the platform.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Positioning / Differentiation */}
      <section id="positioning" className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-12">
          <div className="chip mb-3">The Difference</div>
          <h2 className="font-display text-4xl font-bold tracking-tight">We do the intelligence work automatically.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 text-[15px]">
          <div>
            <h3 className="font-semibold mb-3 text-lg">The Problem Today</h3>
            <p className="text-muted-foreground leading-relaxed">
              Today's cross-border traders navigate a landscape of fragmented directories, dead listings, and manual outreach cycles measured in weeks.
            </p>
            <ul className="mt-5 space-y-2 text-muted-foreground">
              <li>• Scattered opportunities across hundreds of portals</li>
              <li>• Stale, duplicated or incomplete data</li>
              <li>• Hours spent finding the right decision-maker</li>
              <li>• No systematic compliance or payment guidance</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">How DealCompass Compresses Time</h3>
            <p className="text-muted-foreground leading-relaxed">
              DealCompass AI+ compresses that cycle to minutes by doing the intelligence work automatically: scanning, scoring, matching, and pre-structuring deals before a single message is sent.
            </p>

            <div className="mt-6 bg-ink text-paper p-5 rounded-xl text-sm">
              <div className="font-semibold mb-2">Architecturally distinct from B2B marketplaces</div>
              <p className="text-paper/70">
                Alibaba, TradeIndia and Kompass wait for suppliers to self-register and buyers to search.<br />
                DealCompass <span className="text-gold">actively crawls</span> external sources, normalizes raw data, and uses AI to match and pre-generate deal structures — whether or not the counterparty has ever heard of the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t text-sm text-muted-foreground">
          Primary geographic focus: <span className="font-medium text-ink">Iraq–Iran–Turkey–EU corridor</span> — a high-volume, underserved trade lane where existing digital infrastructure is weakest.
        </div>
      </section>

      {/* Engines */}
      <section id="engines" className="bg-ink text-paper py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <div className="chip mb-3 bg-paper/10 text-gold border-paper/20">Six Intelligence Engines</div>
              <h2 className="font-display text-5xl font-extrabold tracking-tight">One terminal.<br />Complete intelligence stack.</h2>
            </div>
            <p className="max-w-sm text-paper/60 text-lg">
              Actively crawls. Normalizes. Scores. Matches. Pre-structures. Delivers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engines.map((e, idx) => (
              <div key={idx} className="group bg-paper/5 hover:bg-paper/10 border border-paper/10 p-7 rounded-2xl transition">
                <div className="font-mono text-xs text-gold mb-3 tracking-widest">ENGINE {e.n}</div>
                <div className="font-semibold text-2xl text-paper mb-3">{e.title}</div>
                <p className="text-paper/70 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages & Corridor */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="uppercase text-xs tracking-[3px] font-semibold text-gold mb-2">Built for the corridor</div>
            <div className="font-display text-4xl font-bold tracking-tight">Iraq • Iran • Turkey • EU</div>
            <p className="mt-4 text-muted-foreground max-w-md">
              High-volume, underserved trade lane where the gap between available data and actionable intelligence is largest.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium mb-3">Five languages • RTL-native</div>
            <div className="flex flex-wrap gap-2">
              {["English", "Arabic", "Farsi (Persian)", "Kurdish (Sorani)", "Turkish"].map(l => (
                <div key={l} className="px-4 py-1.5 bg-muted text-sm rounded-full border">{l}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Stop negotiating in the dark.<br />Trade with complete intelligence.
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">Join early access and start discovering scored, executable opportunities today.</p>
          
          <div className="flex justify-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gold text-ink px-10">Enter DealCompass AI+</Button>
            </Link>
            <Link to="/opportunities">
              <Button size="lg" variant="outline">Explore Live Opportunities</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-9 text-xs text-center bg-ink text-paper/60">
        DealCompass AI+ • Trade Intelligence Terminal • 2026
      </footer>
    </div>
  );
}
