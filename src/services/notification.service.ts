import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export class NotificationService extends BaseService {
  constructor() {
    super('NotificationService');
  }

  async sendNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    channels?: string[];
  }): Promise<void> {
    const { userId, type, title, message, metadata } = params;

    // Store in-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      metadata: metadata || {},
    });

    this.log('info', `Notification sent to ${userId}`, { type, title });

    // In production: also send via Email / WhatsApp using external services
    // For now we log the intent
    if (params.channels?.includes('email')) {
      this.log('info', 'Would send email notification', { userId, title });
    }
    if (params.channels?.includes('whatsapp')) {
      this.log('info', 'Would send WhatsApp notification', { userId, title });
    }
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
  }
}

export const notificationService = new NotificationService();
