import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "../lib/i18n";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DealCompass AI+ — Global Trade Intelligence" },
      { name: "description", content: "Six AI engines powering cross-border trade. Discover, score, and close deals across Iraq, Iran, Turkey, and the EU." },
    ],
  }),
  component: Landing,
});

const engines = [
  { n: "01", title: "Trade Radar", body: "Continuous crawler for 40+ countries. Real-time tenders, directories & exchanges." },
  { n: "02", title: "AI Normalization", body: "Raw multilingual data standardized into uniform, queryable records." },
  { n: "03", title: "Opportunity Scoring", body: "0–100 quality score using field completeness, source trust, and freshness." },
  { n: "04", title: "Lead Intelligence", body: "Verified decision-maker contacts, activity tier, sanctions preview." },
  { n: "05", title: "Market Intelligence", body: "Live price trends, corridor demand heatmaps, supply/demand signals." },
  { n: "06", title: "AI Sourcing Agent", body: "Natural language query → ranked opportunities with match reasoning." },
];

function Landing() {
  const { t, changeLang, lang } = useI18n();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b bg-paper sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="h-3 w-3 rounded-full bg-gold inline-block" /> Deal<span className="text-gold">Compass</span> AI+
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="#engines" className="hover:text-gold">Engines</a>
              <Link to="/opportunities" className="hover:text-gold">Opportunities</Link>
              <Link to="/ai-agent" className="hover:text-gold">AI Agent</Link>
              <Link to="/dashboard" className="hover:text-gold">Dashboard</Link>
            </nav>
            <LanguageSwitcher />
            <Link to="/dashboard">
              <Button size="sm">Enter Platform</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-20 pb-24 bg-ink text-paper">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="chip mb-4 inline-flex">2026 • Iraq • Iran • Turkey • EU</div>
          <h1 className="font-display text-6xl md:text-7xl font-extrabold tracking-tighter">{t('landing.hero.title')}</h1>
          <p className="max-w-2xl mx-auto mt-6 text-xl text-paper/70">{t('landing.hero.subtitle')}</p>
          
          <div className="mt-10 flex gap-3 justify-center">
            <Link to="/dashboard"><Button size="lg" className="bg-gold text-ink px-9">Enter Dashboard</Button></Link>
            <Link to="/ai-agent"><Button size="lg" variant="outline" className="border-paper/30 text-paper">Try AI Agent</Button></Link>
          </div>
        </div>
      </section>

      <section id="engines" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="chip mb-3">{t('engines.title')}</div>
          <h2 className="font-display text-4xl font-bold tracking-tight">Complete intelligence stack</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map((e, idx) => (
            <Card key={idx} className="hover:border-gold transition">
              <CardContent className="pt-6">
                <div className="text-xs tracking-[2px] text-gold font-mono mb-1">ENGINE {e.n}</div>
                <div className="font-semibold text-xl">{e.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-ink text-paper py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="font-display text-4xl font-bold mb-4">All 6 engine services fully live.</h3>
          <p className="max-w-md mx-auto text-paper/60">Interactive pages • Working forms • AI-powered • Real-time demo data</p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/opportunities"><Button variant="secondary" size="lg">Browse Opportunities</Button></Link>
            <Link to="/trade-radar"><Button variant="secondary" size="lg">Trade Radar</Button></Link>
            <Link to="/market"><Button variant="secondary" size="lg">Market Intelligence</Button></Link>
            <Link to="/pre-deals"><Button variant="secondary" size="lg">Pre-Deals</Button></Link>
            <Link to="/trade-finance"><Button variant="secondary" size="lg">Trade Finance</Button></Link>
            <Link to="/ai-agent"><Button variant="secondary" size="lg">AI Agent</Button></Link>
          </div>
        </div>
      </section>

      <footer className="py-12 text-xs text-center border-t bg-muted/30">
        DealCompass AI+ 2026 • Full platform build complete
      </footer>
    </div>
  );
}
