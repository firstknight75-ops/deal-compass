import { useI18n, languages, Language } from '../lib/i18n';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { lang, changeLang } = useI18n();

  const current = languages.find(l => l.code === lang)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-sm">
          <Globe className="h-4 w-4" />
          <span>{current.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {languages.map((l) => (
          <DropdownMenuItem 
            key={l.code} 
            onClick={() => changeLang(l.code)}
            className={lang === l.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{l.native}</span>
            <span className="text-xs text-muted-foreground">{l.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
