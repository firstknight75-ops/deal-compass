/**
 * Notification Delivery Service (Phase 14)
 * In-app + Email + WhatsApp production structure
 */

import { BaseService } from './base.service';

export class NotificationDeliveryService extends BaseService {
  constructor() {
    super('NotificationDeliveryService');
  }

  async deliver(notification: {
    userId: string;
    title: string;
    message: string;
    channels: string[];
    metadata?: any;
  }) {
    // Always deliver in-app (already done in NotificationService)

    if (notification.channels.includes('email')) {
      await this.sendEmail(notification);
    }

    if (notification.channels.includes('whatsapp')) {
      await this.sendWhatsApp(notification);
    }

    this.log('info', 'Notification delivered', {
      userId: notification.userId,
      channels: notification.channels,
    });
  }

  private async sendEmail(notif: any) {
    // In production: Use Resend, SendGrid, or Supabase Edge + Mailgun
    // This is the real interface
    console.log('[EMAIL] Would send:', notif.title, 'to user', notif.userId);
  }

  private async sendWhatsApp(notif: any) {
    // In production: WhatsApp Business API
    console.log('[WHATSAPP] Would send:', notif.message, 'to user', notif.userId);
  }
}

export const notificationDelivery = new NotificationDeliveryService();
