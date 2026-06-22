/**
 * Main API Router — Production
 * All external calls go through this.
 */
import { handleApiRequest } from './router';
import { runAllBackgroundJobs } from '../workers/background-jobs';

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    // Background / Admin jobs (protected in production)
    if (url.pathname === '/api/jobs/run' && request.method === 'POST') {
      const result = await runAllBackgroundJobs();
      return Response.json({ success: true, result });
    }

    if (url.pathname.startsWith('/api')) {
      return await handleApiRequest(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
