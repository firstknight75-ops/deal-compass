/**
 * Email Delivery Service (Production)
 * Ready for Resend, SendGrid, or Supabase + SMTP
 */

import { BaseService } from './base.service';

export class EmailService extends BaseService {
  constructor() {
    super('EmailService');
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }) {
    // In production:
    // await resend.emails.send({...})

    this.log('info', 'Email queued (stub)', {
      to: params.to,
      subject: params.subject,
    });

    // For now we just log. Replace with real provider.
    return { sent: true, provider: 'stub' };
  }
}

export const emailService = new EmailService();
