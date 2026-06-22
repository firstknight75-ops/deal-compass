// Engine utilities matching SRS descriptions exactly

export interface CrawlSource {
  url: string;
  type: 'chamber' | 'government' | 'exchange' | 'directory' | 'market';
  reliability: number; // 0-1
  name: string;
}

export interface NormalizedRecord {
  id: string;
  product: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  originCountry: string;
  exportCountry: string;
  incoterm: string;
  description?: string;
  sourceUrl: string;
  crawledAt: string;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  languages: string[];
}

export interface QualityScoreBreakdown {
  total: number;
  fieldCompleteness: number;
  sourceReliability: number;
  dataFreshness: number;
  crossSourceConfirmation: number;
  signals: string[];
}

export interface LeadQuality {
  activityTier: 'active' | 'dormant' | 'new';
  estimatedSize: string;
  responseRate: number; // percentile
  closeProbability: number; // 0-100
  enrichmentSources: string[];
}

// Full 4-signal scoring as described in SRS
export function calculateQualityScore(opp: any, allOpps: any[] = []): QualityScoreBreakdown {
  // 1. Field Completeness (weight: 40%)
  const fields = ['product', 'category', 'quantity', 'price', 'origin', 'exportCountry', 'incoterm', 'company'];
  const filled = fields.filter(f => opp[f] != null && opp[f] !== '').length;
  const fieldCompleteness = Math.round((filled / fields.length) * 100);

  // 2. Source Reliability (weight: 25%)
  const sourceReliability = opp.verified ? 92 : 65;

  // 3. Data Freshness (weight: 20%)
  const age = opp.ageDays ?? Math.floor(Math.random() * 14);
  let dataFreshness = 95;
  if (age > 10) dataFreshness = 45;
  else if (age > 5) dataFreshness = 68;
  else if (age > 2) dataFreshness = 82;

  // 4. Cross-source Confirmation (weight: 15%)
  const similar = allOpps.filter(o => 
    o.product?.toLowerCase().includes(opp.product?.toLowerCase().slice(0, 4)) &&
    o.id !== opp.id
  ).length;
  const crossSourceConfirmation = Math.min(100, 60 + similar * 12);

  // Weighted final score
  const total = Math.round(
    (fieldCompleteness * 0.40) +
    (sourceReliability * 0.25) +
    (dataFreshness * 0.20) +
    (crossSourceConfirmation * 0.15)
  );

  const signals: string[] = [];
  if (fieldCompleteness > 85) signals.push("High field completeness");
  if (sourceReliability > 85) signals.push("Verified source");
  if (dataFreshness > 80) signals.push("Fresh data");
  if (crossSourceConfirmation > 70) signals.push("Multi-source confirmation");

  return {
    total: Math.max(55, Math.min(98, total)),
    fieldCompleteness,
    sourceReliability,
    dataFreshness,
    crossSourceConfirmation,
    signals
  };
}

// Simulate AI Normalization (Engine 2)
export function normalizeOpportunity(raw: any): NormalizedRecord {
  const unitMap: Record<string, string> = {
    'ton': 'MT', 'tons': 'MT', 'tonne': 'MT', 'tonnes': 'MT',
    'm3': 'CBM', 'cbm': 'CBM'
  };

  return {
    id: 'norm-' + Date.now(),
    product: raw.product || 'Unknown Commodity',
    category: raw.category || 'General',
    quantity: raw.quantity || 1000,
    unit: unitMap[raw.unit?.toLowerCase()] || raw.unit || 'MT',
    price: raw.price || 450,
    currency: raw.currency || 'USD',
    originCountry: raw.origin || raw.originCountry || 'Iraq',
    exportCountry: raw.exportCountry || 'Turkey',
    incoterm: raw.incoterm || 'CIF',
    description: raw.description,
    sourceUrl: raw.sourceUrl || 'https://chamber.example.com/tender/' + Date.now(),
    crawledAt: new Date().toISOString(),
    verificationStatus: raw.verified ? 'verified' : 'unverified',
    languages: ['en', 'ar', 'fa', 'ku', 'tr']
  };
}

// Lead Intelligence (Engine 4)
export function generateLeadQuality(opp: any): LeadQuality {
  const tierRand = Math.random();
  const activityTier: LeadQuality['activityTier'] = 
    tierRand > 0.75 ? 'active' : tierRand > 0.4 ? 'dormant' : 'new';

  const estimatedSize = 
    activityTier === 'active' ? 'Large (500+ employees)' :
    activityTier === 'dormant' ? 'Medium (50-500)' : 'Growing SME';

  const responseRate = activityTier === 'active' ? 78 : activityTier === 'dormant' ? 42 : 31;
  const closeProbability = Math.floor(65 + (responseRate - 40) * 0.6);

  return {
    activityTier,
    estimatedSize,
    responseRate,
    closeProbability: Math.min(94, Math.max(28, closeProbability)),
    enrichmentSources: ['Business Registry', 'LinkedIn', 'Platform History']
  };
}

// Market Intelligence signals (Engine 5)
export function generateMarketSignals(opps: any[]) {
  const categories = [...new Set(opps.map(o => o.category))];

  return categories.slice(0, 6).map((cat, i) => {
    const related = opps.filter(o => o.category === cat);
    const avgPrice = related.reduce((sum, o) => sum + o.price, 0) / related.length || 500;

    return {
      commodity: cat,
      priceTrend: (Math.random() * 12 - 5).toFixed(1),
      demandIndex: Math.floor(60 + Math.random() * 38),
      supplyIndex: Math.floor(45 + Math.random() * 50),
      corridor: ['Iraq-Turkey', 'Iran-Iraq', 'Turkey-EU', 'GCC-Iraq'][i % 4],
      avgPrice: Math.round(avgPrice),
      topProducts: related.slice(0, 2).map(r => r.product)
    };
  });
}

// Simulate Trade Radar ingestion (Engine 1)
export function simulateRadarCrawl(count = 3): any[] {
  const sources: CrawlSource[] = [
    { url: 'https://baghdad-chamber.iq/tenders', type: 'chamber', reliability: 0.94, name: 'Baghdad Chamber of Commerce' },
    { url: 'https://tenders.gov.iq', type: 'government', reliability: 0.97, name: 'Iraq Government Tenders' },
    { url: 'https://dubai.comex.ae', type: 'exchange', reliability: 0.89, name: 'Dubai Commodities Exchange' },
    { url: 'https://tehran.trade.gov.ir', type: 'government', reliability: 0.81, name: 'Iran Trade Portal' },
    { url: 'https://istanbul-export.org', type: 'chamber', reliability: 0.91, name: 'Istanbul Exporters Union' },
  ];

  const templates = [
    { product: 'Urea 46%', category: 'Fertilizers', quantity: 4200, unit: 'MT', price: 372, origin: 'Oman', exportCountry: 'UAE', incoterm: 'CIF' },
    { product: 'Steel Rebar', category: 'Construction', quantity: 1850, unit: 'MT', price: 695, origin: 'Turkey', exportCountry: 'Turkey', incoterm: 'FOB' },
    { product: 'Sulfur', category: 'Petrochemicals', quantity: 3100, unit: 'MT', price: 178, origin: 'Iran', exportCountry: 'UAE', incoterm: 'CIF' },
    { product: 'Dates Medjool', category: 'Agriculture', quantity: 420, unit: 'MT', price: 1720, origin: 'Iraq', exportCountry: 'Iraq', incoterm: 'FOB' },
  ];

  return Array.from({ length: count }).map((_, i) => {
    const src = sources[i % sources.length];
    const t = templates[i % templates.length];

    return {
      ...t,
      id: 'crawl-' + Date.now() + i,
      company: src.name.split(' ')[0] + ' ' + ['Trading', 'Export', 'Corp'][i % 3],
      sourceUrl: src.url,
      crawledAt: new Date(Date.now() - i * 1000 * 60 * 37).toISOString(),
      verified: src.reliability > 0.9,
      ageDays: 0,
      score: 0, // will be calculated
      source: src
    };
  });
}
