/**
 * Main API Router — Production
 * All external calls go through this.
 * All /api paths protected with rate-limit + error-handling + auth where appropriate.
 */
import { handleApiRequest } from './router';
import { runAllBackgroundJobs } from '../workers/background-jobs';
import { withRateLimit } from './middleware/rate-limit';
import { withErrorHandling } from '../lib/errors';
import { requireAuth } from './middleware/auth';

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    // Background / Admin jobs (protected in production)
    if (url.pathname === '/api/jobs/run' && request.method === 'POST') {
      const jobHandler = async (req: Request) => {
        // Require auth for admin job trigger (can be tightened with role)
        await requireAuth(req);
        const result = await runAllBackgroundJobs();
        return Response.json({ success: true, result });
      };
      return await withRateLimit(withErrorHandling(jobHandler), { max: 10 })(request);
    }

    if (url.pathname.startsWith('/api')) {
      // Top level protection wrapper for all API routes
      const protectedApiHandler = async (req: Request) => {
        return await handleApiRequest(req);
      };
      return await withRateLimit(withErrorHandling(protectedApiHandler))(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
