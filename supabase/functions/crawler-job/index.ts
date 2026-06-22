// Supabase Edge Function: /functions/crawler-job
// Deploy with: supabase functions deploy crawler-job

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    const { sourceId } = await req.json();

    // Call the orchestrator logic (in real world this would import from src)
    // For now we trigger via database function or direct logic

    const { data, error } = await supabase.rpc('run_crawler_for_source', { p_source_id: sourceId });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, result: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
