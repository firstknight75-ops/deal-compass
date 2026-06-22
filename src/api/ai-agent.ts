/**
 * Real AI Sourcing Agent API Endpoint
 */
import { aiSourcingAgentService } from '../services/ai-sourcing.service';

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
    console.error('[AI Agent API]', error);
    return Response.json({ error: error.message || 'AI processing failed' }, { status: 500 });
  }
}
