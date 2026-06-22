/**
 * Minimal In-Memory Event Bus (Production foundation)
 * Use for cross-service communication without tight coupling.
 */
type Listener = (payload: any) => void | Promise<void>;

class EventBus {
  private listeners = new Map<string, Listener[]>();

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
  }

  async emit(event: string, payload: any = {}) {
    const list = this.listeners.get(event) || [];
    for (const listener of list) {
      try {
        await listener(payload);
      } catch (e) {
        console.error(`[EventBus] Listener error for ${event}`, e);
      }
    }
  }

  off(event: string, listener: Listener) {
    const list = this.listeners.get(event) || [];
    const idx = list.indexOf(listener);
    if (idx > -1) list.splice(idx, 1);
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

// Core domain events
export const EVENTS = {
  OPPORTUNITY_CREATED: 'opportunity.created',
  PRE_DEAL_GENERATED: 'pre_deal.generated',
  CREDITS_SPENT: 'credits.spent',
  USER_UPDATED: 'user.updated',
  BILLING_UPGRADED: 'billing.upgraded',
  RATE_LIMIT_EXCEEDED: 'rate.limit.exceeded',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];
