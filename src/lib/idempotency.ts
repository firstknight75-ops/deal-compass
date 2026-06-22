/**
 * Production Idempotency Helper
 */
import { supabaseAdmin } from './supabase/server';

export async function withIdempotency<T>(
  key: string,
  operation: () => Promise<T>,
  ttlMinutes = 60
): Promise<T> {
  // Check if we already processed this key
  const { data: existing } = await supabaseAdmin
    .from('idempotency_keys')
    .select('result')
    .eq('key', key)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  if (existing) {
    return existing.result as T;
  }

  const result = await operation();

  // Store result
  await supabaseAdmin.from('idempotency_keys').insert({
    key,
    result,
    expires_at: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
  });

  return result;
}
