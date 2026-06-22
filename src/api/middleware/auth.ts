/**
 * Production Server-side Auth Middleware
 * Validates JWT and loads user with role
 */
import { createServerSupabaseClient } from '../../lib/supabase/server';
import { supabaseAdmin } from '../../lib/supabase/server';

export interface AuthContext {
  user: any;
  role: string;
  isAuthenticated: boolean;
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createServerSupabaseClient(token);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Invalid token');
  }

  // Load full user record with role
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user: profile || user,
    role: profile?.role || 'user',
    isAuthenticated: true,
  };
}

export async function requireRole(request: Request, allowedRoles: string[]) {
  const auth = await requireAuth(request);
  if (!allowedRoles.includes(auth.role)) {
    throw new Error('Forbidden: Insufficient role');
  }
  return auth;
}
