import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getUser, updateUser } from '../lib/mockData';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';
import { useState } from 'react';

export const Route = createFileRoute('/billing')({
  component: BillingPage,
});

const tiers = [
  { name: 'Bronze', price: 49, credits: 10 },
  { name: 'Silver', price: 149, credits: 30 },
  { name: 'Gold', price: 349, credits: 100 },
  { name: 'Platinum', price: 749, credits: 9999 },
];

function BillingPage() {
  const { t } = useI18n();
  const [user, setUser] = useState(getUser());

  const upgrade = (tier: string, credits: number) => {
    const updated = updateUser({ tier: tier.toLowerCase() as any, credits: user.credits + credits });
    setUser(updated);
    toast.success(`Upgraded to ${tier}! +${credits} credits added.`);
  };

  const buyCredits = (amt: number) => {
    const updated = updateUser({ credits: user.credits + amt });
    setUser(updated);
    toast.success(`+${amt} credits purchased.`);
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl font-bold mb-8">Billing &amp; Credits</h1>

        <div className="mb-8">
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <div>Current Plan: <span className="font-semibold text-xl">{user.tier.toUpperCase()}</span></div>
                <div className="text-gold text-3xl font-bold mt-1">{user.credits} Credits</div>
              </div>
              <div>
                <Button onClick={() => buyCredits(25)}>Buy 25 Credits ($29)</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {tiers.map((t, idx) => (
            <Card key={idx} className={user.tier === t.name.toLowerCase() ? 'border-gold' : ''}>
              <CardHeader>
                <CardTitle>{t.name} — ${t.price}/mo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{t.credits} credits/month</p>
                <Button onClick={() => upgrade(t.name, t.credits)} className="w-full" disabled={user.tier === t.name.toLowerCase()}>
                  {user.tier === t.name.toLowerCase() ? 'Current' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-10">Stripe integration ready. All payments simulated in current build.</div>
      </div>
    </div>
  );
}
