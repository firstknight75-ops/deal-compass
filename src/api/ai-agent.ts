/**
 * Real AI Sourcing Agent API Endpoint (DI wired)
 */
import { container } from '../lib/di';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

async function aiAgentHandler(request: Request) {
  const aiSourcingAgentService = container.get<any>('aiSourcingAgentService');

  const auth = await requireAuth(request);
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
}

export const POST = withRateLimit(withErrorHandling(aiAgentHandler), { max: 20 }); // AI is expensive - strict limit
