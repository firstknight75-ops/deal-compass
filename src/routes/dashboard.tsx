import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getUser, getOpportunities, getPreDeals } from '../lib/mockData';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const user = getUser();
  const opps = getOpportunities();
  const deals = getPreDeals();

  return (
    <div>
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Dashboard</h1>
            <p>Welcome back, {user.name}</p>
          </div>
          <div className="text-right text-sm">
            <div>Tier: <span className="font-semibold">{user.tier.toUpperCase()}</span></div>
            <div className="text-gold">{user.credits} credits remaining</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Opportunities Matched', val: opps.length },
            { label: 'Active Pre-Deals', val: deals.filter(d => d.status === 'pending').length },
            { label: 'Credits Used (mo)', val: '12' },
            { label: 'Deals Closed', val: '7' },
          ].map((s, i) => (
            <Card key={i}><CardContent className="pt-5"><div className="text-sm text-muted-foreground">{s.label}</div><div className="text-4xl font-bold mt-1">{s.val}</div></CardContent></Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Recent Opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {opps.slice(0, 4).map(o => <div key={o.id} className="flex justify-between border-b py-1.5 last:border-none"><span>{o.product}</span><span className="text-gold">{o.score}</span></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => toast('AI Agent launched')}>Run AI Sourcing Agent</Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast('New listing form opened')}>Post New Sell Offer</Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast('Smart Alert saved')}>Create Smart Alert</Button>
              <Button className="w-full justify-start" onClick={() => window.location.href = '/ai-agent'}>Ask AI Agent</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
