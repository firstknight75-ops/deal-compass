import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';

export type Role = 'user' | 'compliance_officer' | 'admin' | 'enterprise_admin';

export class AuthorizationService extends BaseService {
  constructor() {
    super('AuthorizationService');
  }

  async hasRole(userId: string, requiredRole: Role | Role[]): Promise<boolean> {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return false;

    return roles.includes(data.role as Role);
  }

  async canAccessOpportunity(userId: string, opportunityId: string): Promise<boolean> {
    // Public opportunities are visible to all
    // Private / paid access can be extended here
    const { data } = await supabaseAdmin
      .from('products')
      .select('is_active')
      .eq('id', opportunityId)
      .single();

    return !!data?.is_active;
  }

  async requireRole(userId: string, required: Role | Role[]) {
    const allowed = await this.hasRole(userId, required);
    if (!allowed) {
      throw new Error(`Forbidden: Requires role ${required}`);
    }
  }
}

export const authorizationService = new AuthorizationService();
