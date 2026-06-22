// SERVER-ONLY — NEVER IMPORT IN CLIENT BUNDLES
// Use only from API routes, workers, and server entry points.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : ({} as any);

export function createServerSupabaseClient(accessToken?: string) {
  if (!supabaseUrl) return {} as any;
  return createClient(
    supabaseUrl,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  );
}
