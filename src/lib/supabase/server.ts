import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for server client');
}

// Server-side client with service role (bypasses RLS — use carefully)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Regular authenticated client (for user context)
export function createServerSupabaseClient(accessToken?: string) {
  const client = createClient(supabaseUrl!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
  return client;
}
