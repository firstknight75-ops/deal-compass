export interface Opportunity {
  id: string;
  type: 'sell' | 'buy' | 'tender' | 'surplus' | 'contract';
  product: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  origin: string;
  exportCountry: string;
  incoterm: string;
  score: number;
  ageDays: number;
  company: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  description?: string;
  verified: boolean;
}

export interface PreDeal {
  id: string;
  opportunityId: string;
  product: string;
  suggestedPrice: number;
  quantity: number;
  buyerId: string;
  sellerId: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  expiresAt: string;
  paymentTerms: string;
}

export interface MarketSignal {
  commodity: string;
  priceTrend: number;
  demandIndex: number;
  supplyIndex: number;
  corridor: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  tracking: string;
  carrier: string;
  status: string;
  eta: string;
  events: Array<{ ts: string; location: string; desc: string }>;
}

let opportunities: Opportunity[] = [
  { id: 'o1', type: 'sell', product: 'Urea 46%', category: 'Fertilizers', quantity: 5000, unit: 'MT', price: 385, currency: 'USD', origin: 'Oman', exportCountry: 'UAE', incoterm: 'CIF', score: 92, ageDays: 2, company: 'Gulf Petrochem', verified: true },
  { id: 'o2', type: 'buy', product: 'Steel Rebar 12mm', category: 'Construction', quantity: 1200, unit: 'MT', price: 720, currency: 'USD', origin: 'Turkey', exportCountry: 'Turkey', incoterm: 'FOB', score: 87, ageDays: 4, company: 'Al-Mansour Trading', verified: true },
  { id: 'o3', type: 'tender', product: 'Cement OPC 42.5', category: 'Construction', quantity: 8500, unit: 'MT', price: 92, currency: 'USD', origin: 'Iraq', exportCountry: 'Iraq', incoterm: 'CIF', score: 78, ageDays: 1, company: 'Iraq Ministry of Construction', verified: true },
  { id: 'o4', type: 'sell', product: 'Base Oil SN150', category: 'Petrochemicals', quantity: 2400, unit: 'MT', price: 950, currency: 'USD', origin: 'Iran', exportCountry: 'UAE', incoterm: 'CIF', score: 85, ageDays: 6, company: 'Persian Refining', verified: false },
  { id: 'o5', type: 'surplus', product: 'Dates (Medjool)', category: 'Agriculture', quantity: 380, unit: 'MT', price: 1650, currency: 'USD', origin: 'Iraq', exportCountry: 'Iraq', incoterm: 'FOB', score: 94, ageDays: 3, company: 'Basra Dates Export', verified: true },
];

let preDeals: PreDeal[] = [
  { id: 'pd1', opportunityId: 'o1', product: 'Urea 46%', suggestedPrice: 375, quantity: 5000, buyerId: 'user1', sellerId: 'seller1', matchScore: 89, status: 'pending', expiresAt: '2026-06-28', paymentTerms: '30% advance, 70% LC at sight' },
];

let marketSignals: MarketSignal[] = [
  { commodity: 'Urea', priceTrend: -3.2, demandIndex: 87, supplyIndex: 62, corridor: 'Iraq-Turkey' },
  { commodity: 'Steel Rebar', priceTrend: 4.1, demandIndex: 94, supplyIndex: 51, corridor: 'Turkey-Iraq' },
  { commodity: 'Cement', priceTrend: -1.8, demandIndex: 73, supplyIndex: 89, corridor: 'GCC-Iraq' },
];

export function getOpportunities(): Opportunity[] {
  return [...opportunities];
}

export function addOpportunity(opp: Partial<Opportunity>): Opportunity {
  const newOpp: Opportunity = {
    id: 'o' + Date.now(),
    type: opp.type || 'sell',
    product: opp.product || 'New Commodity',
    category: opp.category || 'General',
    quantity: opp.quantity || 1000,
    unit: opp.unit || 'MT',
    price: opp.price || 500,
    currency: opp.currency || 'USD',
    origin: opp.origin || 'Iraq',
    exportCountry: opp.exportCountry || 'Turkey',
    incoterm: opp.incoterm || 'CIF',
    score: opp.score || Math.floor(Math.random() * 30) + 70,
    ageDays: 0,
    company: opp.company || 'Demo Company',
    verified: true,
    ...opp
  };
  opportunities = [newOpp, ...opportunities];
  return newOpp;
}

export function getPreDeals(): PreDeal[] {
  return [...preDeals];
}

export function updatePreDeal(id: string, status: PreDeal['status']): PreDeal | undefined {
  const idx = preDeals.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  preDeals[idx] = { ...preDeals[idx], status };
  return preDeals[idx];
}

export function generatePreDealsForOpp(oppId: string): PreDeal[] {
  const opp = opportunities.find(o => o.id === oppId);
  if (!opp) return [];
  const newPd: PreDeal = {
    id: 'pd' + Date.now(),
    opportunityId: oppId,
    product: opp.product,
    suggestedPrice: Math.round(opp.price * 0.97),
    quantity: opp.quantity,
    buyerId: 'current-user',
    sellerId: 'seller-' + oppId,
    matchScore: Math.floor(opp.score * 0.92),
    status: 'pending',
    expiresAt: new Date(Date.now() + 1000 * 3600 * 72).toISOString().split('T')[0],
    paymentTerms: opp.type === 'sell' ? 'LC at sight + 20% advance' : 'Escrow release on delivery',
  };
  preDeals = [newPd, ...preDeals];
  return [newPd];
}

export function getMarketSignals(): MarketSignal[] {
  return [...marketSignals];
}

export function unlockContact(oppId: string): Opportunity | undefined {
  const opp = opportunities.find(o => o.id === oppId);
  if (!opp) return;
  // Simulate unlocking
  opp.contactName = 'Ahmed Al-Khalid';
  opp.contactPhone = '+964 770 123 4567';
  opp.contactEmail = 'ahmed@' + opp.company.toLowerCase().replace(/\s+/g, '') + '.com';
  return opp;
}

export function runRadarScan(): Opportunity[] {
  const newOnes = [
    { id: 'scan' + Date.now(), type: 'sell' as const, product: 'Sulfur Granular', category: 'Petrochemicals', quantity: 3200, unit: 'MT', price: 185, currency: 'USD', origin: 'Iran', exportCountry: 'UAE', incoterm: 'FOB', score: 81, ageDays: 0, company: 'Iran Sulphur Corp', verified: true },
    { id: 'scan' + (Date.now() + 1), type: 'buy' as const, product: 'Wheat (Soft)', category: 'Agriculture', quantity: 15000, unit: 'MT', price: 265, currency: 'USD', origin: 'Russia', exportCountry: 'Turkey', incoterm: 'CIF', score: 76, ageDays: 0, company: 'Baghdad Grains', verified: true },
  ];
  opportunities = [...newOnes, ...opportunities];
  return newOnes;
}

export interface User {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';
  credits: number;
  country: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
}

export let currentUser: User = {
  id: 'u-current',
  name: 'Khalid Al-Rashid',
  email: 'khalid@alrashidtrade.com',
  tier: 'silver',
  credits: 28,
  country: 'Iraq',
  kycStatus: 'approved',
};

export function useCredits(amount: number): boolean {
  if (currentUser.credits >= amount) {
    currentUser.credits -= amount;
    return true;
  }
  return false;
}

export function getUser(): User {
  return { ...currentUser };
}

export function updateUser(updates: Partial<User>): User {
  currentUser = { ...currentUser, ...updates };
  return { ...currentUser };
}
