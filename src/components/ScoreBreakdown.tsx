import { cn } from '../lib/utils';

interface ScoreBreakdownProps {
  breakdown?: {
    total: number;
    fieldCompleteness: number;
    sourceReliability: number;
    dataFreshness: number;
    crossSourceConfirmation: number;
    signals?: string[];
  };
  compact?: boolean;
}

export function ScoreBreakdown({ breakdown, compact = false }: ScoreBreakdownProps) {
  if (!breakdown) return null;

  const { total, fieldCompleteness, sourceReliability, dataFreshness, crossSourceConfirmation, signals } = breakdown;

  const items = [
    { label: 'Field Completeness', value: fieldCompleteness, weight: '40%' },
    { label: 'Source Reliability', value: sourceReliability, weight: '25%' },
    { label: 'Data Freshness', value: dataFreshness, weight: '20%' },
    { label: 'Cross-Source Confirmation', value: crossSourceConfirmation, weight: '15%' },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {items.map((item, i) => (
          <span key={i}>{item.label.split(' ')[0]}: <strong className="text-ink">{item.value}</strong></span>
        ))}
        <span className="font-mono text-gold font-bold">TOTAL {total}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium">Quality Score Breakdown (SRS 4-signal)</div>
        <div className="font-display text-4xl font-bold text-gold tracking-tighter">{total}</div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const pct = Math.max(30, Math.min(100, item.value));
          return (
            <div key={index}>
              <div className="flex justify-between text-xs mb-1">
                <span>{item.label} <span className="text-muted-foreground">({item.weight})</span></span>
                <span className="font-mono font-semibold">{item.value}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all" 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {signals && signals.length > 0 && (
        <div className="pt-2">
          <div className="text-xs font-medium mb-1.5">Key Signals</div>
          <div className="flex flex-wrap gap-1.5">
            {signals.map((s, i) => (
              <div key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
