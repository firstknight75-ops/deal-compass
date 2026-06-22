import { Link } from '@tanstack/react-router';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';
import { User, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  tier?: string;
  account_tier?: string;
  credits?: number;
  credits_balance?: number;
  country?: string;
}

export function AppHeader() {
  const { t } = useI18n();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const json = await res.json();
          const u = json.data || json;
          setUser({
            ...u,
            name: u.full_name || u.name || 'User',
            tier: u.account_tier || u.tier || 'silver',
            credits: u.credits_balance ?? u.credits ?? 28,
          });
        } else {
          // demo fallback
          setUser({ id: 'demo', name: 'Khalid', email: 'demo@dealcompass.ai', tier: 'silver', credits: 28 });
        }
      } catch {
        setUser({ id: 'demo', name: 'Khalid', email: 'demo@dealcompass.ai', tier: 'silver', credits: 28 });
      }
    };
    fetchUser();
  }, []);

  const displayName = user?.name || 'User';
  const credits = user?.credits ?? 28;
  const tier = user?.tier || 'silver';

  return (
    <header className="sticky top-0 z-50 border-b bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
            <span className="inline-block h-3 w-3 rounded-full bg-gold" />
            Deal<span className="text-gold">Compass</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/engines" className="hover:text-gold transition">Engines</Link>
            <Link to="/trade-radar" className="hover:text-gold transition">{t('nav.radar')}</Link>
            <Link to="/opportunities" className="hover:text-gold transition">{t('nav.opportunities')}</Link>
            <Link to="/ai-agent" className="hover:text-gold transition">{t('nav.aiAgent')}</Link>
            <Link to="/market" className="hover:text-gold transition">{t('nav.market')}</Link>
            <Link to="/engine-status" className="hover:text-gold transition text-xs">Status</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1 bg-muted rounded-full">
            <CreditCard className="h-3.5 w-3.5" />
            <span>{credits} {t('credits')}</span>
            <span className="text-muted-foreground">· {tier}</span>
          </div>
          
          <LanguageSwitcher />
          
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" /> {displayName.split(' ')[0]}
            </Button>
          </Link>
          
          <Link to="/billing">
            <Button size="sm" variant="outline">Upgrade</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
