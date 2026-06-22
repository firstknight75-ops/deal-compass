import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

// Production AI Normalization API (DI wired)

async function normalizationGETHandler(request: Request) {
  await requireAuth(request);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const { data, error } = await (await import('../lib/supabase/server')).supabaseAdmin
    .from('normalized_records')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const formatted = (data || []).map((rec: any) => ({
    id: rec.id,
    product: rec.product_name,
    category: rec.category,
    quantity: rec.quantity,
    unit: rec.unit,
    price: rec.price,
    currency: rec.currency,
    originCountry: rec.origin_country,
    exportCountry: rec.export_country,
    incoterm: rec.incoterm,
    verificationStatus: rec.confidence_score > 0.8 ? 'verified' : 'pending',
    sourceUrl: rec.source_url || 'https://crawl.source/normalized',
    confidence: rec.confidence_score,
  }));

  return Response.json({ data: formatted, count: formatted.length });
}

async function normalizationPOSTHandler(request: Request) {
  const normalizationService = container.get<any>('normalizationService');

  await requireAuth(request);
  const body = await request.json();
  const { rawRecords } = body;

  const results = [];
  for (const raw of (rawRecords || [])) {
    const norm = await normalizationService.normalizeRawDocument('batch', raw);
    results.push(norm);
  }

  const { data } = await (await import('../lib/supabase/server')).supabaseAdmin
    .from('normalized_records')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return Response.json({ 
    data: results,
    recent: (data || []).map((r: any) => ({
      product: r.product_name,
      originCountry: r.origin_country,
      exportCountry: r.export_country,
      quantity: r.quantity,
      unit: r.unit,
      price: r.price,
      incoterm: r.incoterm,
      verificationStatus: 'normalized',
    }))
  });
}

export const GET = withRateLimit(withErrorHandling(normalizationGETHandler));
export const POST = withRateLimit(withErrorHandling(normalizationPOSTHandler));
