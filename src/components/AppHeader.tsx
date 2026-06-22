import { Link } from '@tanstack/react-router';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';
import { User, CreditCard } from 'lucide-react';
import { getUser } from '../lib/mockData';

export function AppHeader() {
  const { t } = useI18n();
  const user = getUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
            <span className="inline-block h-3 w-3 rounded-full bg-gold" />
            Deal<span className="text-gold">Compass</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/opportunities" className="hover:text-gold transition">{t('nav.opportunities')}</Link>
            <Link to="/ai-agent" className="hover:text-gold transition">{t('nav.aiAgent')}</Link>
            <Link to="/market" className="hover:text-gold transition">{t('nav.market')}</Link>
            <Link to="/pre-deals" className="hover:text-gold transition">{t('nav.predeals')}</Link>
            <Link to="/trade-finance" className="hover:text-gold transition">{t('nav.finance')}</Link>
            <Link to="/trade-radar" className="hover:text-gold transition">{t('nav.radar')}</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1 bg-muted rounded-full">
            <CreditCard className="h-3.5 w-3.5" />
            <span>{user.credits} {t('credits')}</span>
            <span className="text-muted-foreground">· {user.tier}</span>
          </div>
          
          <LanguageSwitcher />
          
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" /> {user.name.split(' ')[0]}
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
