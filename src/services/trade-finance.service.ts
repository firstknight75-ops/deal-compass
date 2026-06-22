/**
 * Trade Finance Engine (Phase 11)
 * Real workflows for Escrow, LC, Documentary Collection
 */

import { BaseService } from './base.service';
import { supabaseAdmin } from '../lib/supabase/server';
import { notificationService } from './notification.service';

export type FinanceInstrument = 'escrow' | 'letter_of_credit' | 'documentary_collection';

export class TradeFinanceService extends BaseService {
  constructor() {
    super('TradeFinanceService');
  }

  async createOrderFromPreDeal(preDealId: string, buyerId: string, sellerId: string) {
    const { data: preDeal } = await supabaseAdmin
      .from('pre_deals')
      .select('*')
      .eq('id', preDealId)
      .single();

    if (!preDeal) throw new Error('Pre-deal not found');

    const { data: order } = await supabaseAdmin
      .from('orders')
      .insert({
        pre_deal_id: preDealId,
        buyer_id: buyerId,
        seller_id: sellerId,
        total_value: preDeal.suggested_price * (preDeal.suggested_quantity || 1),
        currency: 'USD',
        status: 'pending',
        payment_method: 'letter_of_credit', // default recommendation
      })
      .select()
      .single();

    await notificationService.sendNotification({
      userId: buyerId,
      type: 'order_created',
      title: 'Order Created',
      message: `Order from pre-deal ${preDealId} has been created.`,
    });

    return order;
  }

  async createLetterOfCredit(orderId: string, data: {
    issuing_bank: string;
    amount: number;
    currency: string;
    expiry_date: string;
  }) {
    const { data: lc } = await supabaseAdmin
      .from('letters_of_credit')
      .insert({
        order_id: orderId,
        lc_number: `LC-${Date.now()}`,
        issuing_bank: data.issuing_bank,
        amount: data.amount,
        currency: data.currency,
        expiry_date: data.expiry_date,
        status: 'draft',
      })
      .select()
      .single();

    return lc;
  }

  async updateLcStatus(lcId: string, status: string) {
    const { data } = await supabaseAdmin
      .from('letters_of_credit')
      .update({ status })
      .eq('id', lcId)
      .select()
      .single();

    return data;
  }

  async openEscrow(orderId: string, amount: number) {
    // In production: integrate with Stripe or licensed escrow provider
    const { data: order } = await supabaseAdmin
      .from('orders')
      .update({
        payment_method: 'escrow',
        status: 'escrow_funded',
      })
      .eq('id', orderId)
      .select()
      .single();

    return { order, escrowStatus: 'held' };
  }
}

export const tradeFinanceService = new TradeFinanceService();
