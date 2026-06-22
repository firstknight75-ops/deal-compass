import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useI18n } from '../lib/i18n';
import { AppHeader } from '../components/AppHeader';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useI18n();
  const [user, setUser] = useState(getUser());
  const [form, setForm] = useState({ name: user.name, country: user.country });

  const save = () => {
    const updated = updateUser({ name: form.name, country: form.country });
    setUser(updated);
    toast.success('Profile updated');
  };

  return (
    <div>
      <AppHeader />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Profile &amp; Settings</h1>

        <Card>
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm">Full Name</label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Country</label>
              <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Email: <span className="font-medium">{user.email}</span></div>
              <div>KYC: <span className="font-medium text-emerald-600">{user.kycStatus}</span></div>
              <div>Tier: <span className="font-medium">{user.tier}</span></div>
              <div>Credits: <span className="font-medium text-gold">{user.credits}</span></div>
            </div>

            <Button onClick={save} className="mt-2">Save Profile</Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>KYC Documents</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm">Upload business license or passport for full access.</div>
            <input type="file" className="mt-3" />
            <Button className="mt-2" variant="outline" onClick={() => toast.success('Documents submitted for review (demo)')}>Submit Documents</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
