import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

interface PreDeal {
  id: string;
  product?: string;
  quantity?: number;
  suggestedPrice?: number;
  suggested_price?: number;
  matchScore?: number;
  match_score?: number;
  status: string;
  expiresAt?: string;
  expires_at?: string;
  paymentTerms?: string;
  payment_recommendation?: string;
}

export const Route = createFileRoute('/pre-deals')({
  component: PreDealsPage,
});

function PreDealsPage() {
  const { t } = useI18n();
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pre-deals');
      const json = await res.json();
      setDeals(json.data || []);
    } catch {
      setDeals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleAction = async (id: string, action: 'accepted' | 'rejected' | 'countered') => {
    try {
      const res = await fetch('/api/pre-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', id, status: action }),
      });
      if (res.ok) {
        await loadDeals();
        if (action === 'accepted') {
          toast.success('Pre-deal accepted! Order created.');
        } else {
          toast('Pre-deal ' + action);
        }
      }
    } catch {
      toast.error('Action failed');
    }
  };

  const generateMore = async () => {
    try {
      const res = await fetch('/api/pre-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });
      if (res.ok) {
        await loadDeals();
        toast.success('New AI-generated pre-deals created.');
      }
    } catch {
      toast.error('Generate failed');
    }
  };

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
          {deals.length === 0 && !loading && <div className="text-center py-8 text-muted-foreground">No pre-deals yet. Generate some.</div>}
          {deals.map(deal => (
            <Card key={deal.id}>
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{deal.product}</div>
                  <div className="text-sm">{deal.quantity || 1000} units @ ${deal.suggestedPrice || deal.suggested_price} suggested</div>
                  <div className="mt-1 text-xs text-muted-foreground">Expires: {deal.expiresAt || deal.expires_at} • {deal.paymentTerms || deal.payment_recommendation}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <Badge>Match: {deal.matchScore || deal.match_score}%</Badge>
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
