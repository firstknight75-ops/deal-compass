/**
 * Production API Router
 * All business logic goes through here — never in components.
 */

import { GET as opportunitiesGET, POST as opportunitiesPOST } from './opportunities';
import { userService } from '../services/user.service';
import { creditsService } from '../services/credits.service';

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');

  try {
    if (path === '/opportunities' || path === '/opportunities/') {
      if (request.method === 'GET') return await opportunitiesGET(request);
      if (request.method === 'POST') return await opportunitiesPOST(request);
    }

    if (path === '/user/me' && request.method === 'GET') {
      const auth = request.headers.get('Authorization');
      if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      // TODO: extract user from token properly
      return Response.json({ message: 'User endpoint - implement JWT parsing' });
    }

    if (path === '/credits/balance' && request.method === 'GET') {
      // Example protected endpoint
      return Response.json({ credits: 28 }); // placeholder until real auth
    }

    return Response.json({ error: 'Not Found' }, { status: 404 });
  } catch (err: any) {
    console.error('[API Router Error]', err);
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
