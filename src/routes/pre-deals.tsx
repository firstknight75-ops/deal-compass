import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/pre-deals')({
  component: PreDealsPage,
});

function PreDealsPage() {
  const { t } = useI18n();
  const [deals, setDeals] = useState(getPreDeals());

  function handleAction(id: string, action: 'accepted' | 'rejected' | 'countered') {
    const updated = updatePreDeal(id, action);
    if (updated) {
      setDeals(getPreDeals());
      if (action === 'accepted') {
        toast.success('Pre-deal accepted! Order created.');
      } else {
        toast('Pre-deal ' + action);
      }
    }
  }

  function generateMore() {
    const opps = getOpportunities();
    if (opps.length) {
      const newDeals = generatePreDealsForOpp(opps[0].id);
      setDeals(getPreDeals());
      toast.success('New AI-generated pre-deal created.');
    }
  }

  return (
    <div>
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Pre-Deals</h1>
            <p className="text-muted-foreground">AI-matched proposals ready for acceptance</p>
          </div>
          <Button onClick={generateMore}>Generate New Pre-Deal</Button>
        </div>

        <div className="space-y-4">
          {deals.map(deal => (
            <Card key={deal.id}>
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{deal.product}</div>
                  <div className="text-sm">{deal.quantity} units @ ${deal.suggestedPrice} suggested</div>
                  <div className="mt-1 text-xs text-muted-foreground">Expires: {deal.expiresAt} • {deal.paymentTerms}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <Badge>Match: {deal.matchScore}%</Badge>
                    <div className="text-xs mt-1">Status: <span className="font-medium">{deal.status}</span></div>
                  </div>
                  
                  {deal.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAction(deal.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                      <Button onClick={() => handleAction(deal.id, 'countered')} variant="outline">Counter</Button>
                      <Button onClick={() => handleAction(deal.id, 'rejected')} variant="ghost">Reject</Button>
                    </div>
                  )}
                  {deal.status !== 'pending' && (
                    <Badge variant={deal.status === 'accepted' ? 'default' : 'secondary'}>{deal.status.toUpperCase()}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
