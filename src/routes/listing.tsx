import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { addOpportunity } from '../lib/mockData';
import { AppHeader } from '../components/AppHeader';
import { toast } from 'sonner';

export const Route = createFileRoute('/listing')({
  component: CreateListing,
});

function CreateListing() {
  const [form, setForm] = useState({
    product: '', quantity: '1000', unit: 'MT', price: '450', origin: 'Iraq', exportCountry: 'Turkey', category: 'Fertilizers', type: 'sell'
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const opp = addOpportunity({
      product: form.product,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      origin: form.origin,
      exportCountry: form.exportCountry,
      category: form.category,
      type: form.type as any,
      unit: form.unit,
    });
    toast.success(`Listing posted! ID: ${opp.id}`);
    setForm({ ...form, product: '' });
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-display font-bold mb-1">Post New Listing</h1>
        <p className="mb-8 text-muted-foreground">Publish a sell offer, demand, or surplus listing</p>

        <Card>
          <CardContent className="pt-8">
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Product Name</label>
                  <Input value={form.product} required onChange={e => setForm({ ...form, product: e.target.value })} placeholder="Urea 46%" />
                </div>
                <div>
                  <label className="text-sm">Type</label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sell">Sell Offer</SelectItem>
                      <SelectItem value="buy">Buy Request</SelectItem>
                      <SelectItem value="surplus">Production Surplus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm">Quantity</label><Input value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                <div><label className="text-sm">Unit</label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
                <div><label className="text-sm">Price (USD)</label><Input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                <div><label className="text-sm">Category</label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
                <div><label className="text-sm">Origin Country</label><Input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} /></div>
                <div><label className="text-sm">Export Country</label><Input value={form.exportCountry} onChange={e => setForm({ ...form, exportCountry: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full mt-4">Publish Listing</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
