import { normalizationService } from '../services/normalization.service';
import { opportunityService } from '../services/opportunity.service';

// Production AI Normalization API

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');

  try {
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
  } catch (error: any) {
    console.error('[API normalization] GET error', error);
    // Fallback empty if no table data yet
    return Response.json({ data: [], count: 0 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { rawRecords } = body;

  try {
    const results = [];
    for (const raw of (rawRecords || [])) {
      const norm = await normalizationService.normalizeRawDocument('batch', raw);
      results.push(norm);
    }

    // Also return recent after run
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
  } catch (error: any) {
    console.error('[API normalization] POST error', error);
    return Response.json({ error: 'Normalization failed' }, { status: 500 });
  }
}
