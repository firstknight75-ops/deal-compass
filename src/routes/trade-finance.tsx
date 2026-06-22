import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/trade-finance')({
  component: TradeFinance,
});

function TradeFinance() {
  const { t } = useI18n();
  const [lcForm, setLcForm] = useState({ amount: '250000', bank: 'Iraq Bank', beneficiary: '' });
  const [escrowForm, setEscrowForm] = useState({ amount: '85000', buyer: 'Al-Mansour' });

  const createLC = () => {
    toast.success(`Letter of Credit draft created. Ref: LC-${Date.now().toString().slice(-6)}`);
  };

  const createEscrow = () => {
    toast.success(`Escrow contract opened. Funds held: $${escrowForm.amount}`);
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl font-bold mb-2">{t('nav.finance')}</h1>
        <p className="text-muted-foreground mb-8">Full trade finance instruments — Escrow, LC, Documentary Collection</p>

        <Tabs defaultValue="escrow">
          <TabsList>
            <TabsTrigger value="escrow">Escrow</TabsTrigger>
            <TabsTrigger value="lc">Letter of Credit</TabsTrigger>
            <TabsTrigger value="dp">Documentary Collection (D/P)</TabsTrigger>
          </TabsList>

          <TabsContent value="escrow" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Open Escrow</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Amount (USD)</Label><Input value={escrowForm.amount} onChange={e=>setEscrowForm({...escrowForm, amount: e.target.value})} /></div>
                  <div><Label>Counterparty</Label><Input value={escrowForm.buyer} onChange={e=>setEscrowForm({...escrowForm, buyer: e.target.value})} /></div>
                </div>
                <Button onClick={createEscrow} className="w-full">Open Escrow (1 credit + 0.6% fee)</Button>
                <p className="text-xs">Funds released on buyer confirmation of receipt. Platform holds until delivery.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lc" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Issue Letter of Credit</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Amount</Label><Input value={lcForm.amount} onChange={e=>setLcForm({...lcForm, amount:e.target.value})} /></div>
                  <div><Label>Issuing Bank</Label><Input value={lcForm.bank} onChange={e=>setLcForm({...lcForm, bank:e.target.value})} /></div>
                  <div><Label>Beneficiary</Label><Input placeholder="Seller Company Name" value={lcForm.beneficiary} onChange={e=>setLcForm({...lcForm, beneficiary:e.target.value})} /></div>
                  <div><Label>Expiry</Label><Input type="date" defaultValue="2026-09-30" /></div>
                </div>
                <Button onClick={createLC} className="w-full">Generate LC Draft &amp; Submit to Bank</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dp" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Documentary Collection</CardTitle></CardHeader>
              <CardContent>
                <p className="mb-4">Submit documents for D/P collection. Platform generates collection instruction.</p>
                <Button onClick={() => toast.success('D/P instruction sent to remitting bank.')}>Initiate Documentary Collection</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
