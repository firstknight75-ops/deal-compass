// This file makes the AI Agent available at /api/ai-agent when using file-based routing
// or when mounted in the API router.

import { aiSourcingAgentService } from '../../services/ai-sourcing.service';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query is required' }, { status: 400 });
    }

    const result = await aiSourcingAgentService.processNaturalLanguageQuery(query);

    return Response.json({
      success: true,
      parsed: result.parsed_filters,
      results: result.results,
      total: result.total_matches,
    });
  } catch (error: any) {
    console.error('[AI Agent API Error]', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'AI processing failed' 
    }, { status: 500 });
  }
}
