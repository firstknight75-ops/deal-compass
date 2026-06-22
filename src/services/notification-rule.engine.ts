/**
 * Notification Rule Engine (Phase 14)
 * Production rule evaluation for Smart Alerts
 */

import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { notificationService } from './notification.service';

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'lt' | 'gt' | 'contains' | 'in';
  value: any;
}

export class NotificationRuleEngine extends BaseService {
  constructor() {
    super('NotificationRuleEngine');
  }

  async evaluateAndNotify(opportunity: any) {
    const { data: rules } = await supabaseAdmin
      .from('notification_rules')
      .select('*')
      .eq('is_active', true);

    if (!rules) return;

    for (const rule of rules) {
      if (this.matchesConditions(opportunity, rule.conditions as RuleCondition[])) {
        await notificationService.sendNotification({
          userId: rule.user_id,
          type: 'smart_alert',
          title: `Match found: ${opportunity.product_name}`,
          message: `${opportunity.origin_country} → ${opportunity.export_country} @ $${opportunity.price}`,
          metadata: { opportunity_id: opportunity.id, rule_id: rule.id },
          channels: rule.channels,
        });
      }
    }
  }

  private matchesConditions(opp: any, conditions: RuleCondition[]): boolean {
    return conditions.every(cond => {
      const val = opp[cond.field] ?? opp[cond.field.replace(/_/g, '')];
      if (val == null) return false;

      switch (cond.operator) {
        case 'eq': return val === cond.value;
        case 'lt': return Number(val) < Number(cond.value);
        case 'gt': return Number(val) > Number(cond.value);
        case 'contains': return String(val).toLowerCase().includes(String(cond.value).toLowerCase());
        default: return false;
      }
    });
  }

  async createRule(userId: string, name: string, conditions: RuleCondition[], channels = ['in_app']) {
    await supabaseAdmin.from('notification_rules').insert({
      user_id: userId,
      name,
      conditions,
      channels,
    });
  }
}

export const notificationRuleEngine = new NotificationRuleEngine();
