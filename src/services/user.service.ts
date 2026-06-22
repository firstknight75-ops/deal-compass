import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { z } from 'zod';
import { getOrSet } from '../lib/cache';
import { logger } from '../lib/logger';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
  role: string;
  account_tier: string;
  credits_balance: number;
  kyc_status: string;
}

const UpdateUserSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export class UserService extends BaseService {
  constructor() {
    super('UserService');
  }

  async getUserById(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`;

    return getOrSet(cacheKey, async () => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.log('error', 'getUserById failed', { userId, error });
        logger.error('User lookup failed', { userId, error: String(error) });
        return null;
      }
      return data;
    }, 120); // 2 minute cache for user profiles
  }

  async updateUser(userId: string, updates: z.infer<typeof UpdateUserSchema>): Promise<User> {
    const parsed = UpdateUserSchema.parse(updates);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(parsed)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error('Failed to update user');

    await this.logAudit(userId, 'user.updated', 'user', userId, updates);
    return data;
  }

  async updateCreditsBalance(userId: string, newBalance: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ credits_balance: newBalance })
      .eq('id', userId);

    if (error) throw error;
  }

  private async logAudit(actorId: string, action: string, resource: string, resourceId: string, payload: any) {
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      action,
      resource_type: resource,
      resource_id: resourceId,
      new_values: payload,
    });
  }
}

export const userService = new UserService();
