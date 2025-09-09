/* eslint-disable @typescript-eslint/no-explicit-any */
// Analytics utilities for tracking marketplace performance

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  productId?: string;
  sellerId?: string;
  orderId?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    // Auto-flush events periodically
    if (typeof window === 'undefined') {
      setInterval(() => {
        this.flush();
      }, this.flushInterval);
    }
  }

  track(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(analyticsEvent);

    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // In a real implementation, you would send these to your analytics service
      // await this.sendToAnalyticsService(eventsToFlush);
      console.log('Analytics events:', eventsToFlush);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events back to queue on failure
      this.events.unshift(...eventsToFlush);
    }
  }

  // Specific tracking methods
  trackProductView(productId: string, userId?: string, sellerId?: string): void {
    this.track({
      event: 'product_viewed',
      productId,
      userId,
      sellerId,
    });
  }

  trackProductAddToCart(productId: string, userId?: string, sellerId?: string, quantity: number = 1): void {
    this.track({
      event: 'product_added_to_cart',
      productId,
      userId,
      sellerId,
      value: quantity,
    });
  }

  trackPurchase(orderId: string, userId: string, totalAmount: number, items: any[]): void {
    this.track({
      event: 'purchase_completed',
      orderId,
      userId,
      value: totalAmount,
      properties: {
        itemCount: items.length,
        items: items.map(item => ({
          productId: item.productId,
          sellerId: item.sellerId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });
  }

  trackSearch(query: string, userId?: string, resultsCount?: number): void {
    this.track({
      event: 'search_performed',
      userId,
      properties: {
        query,
        resultsCount,
      },
    });
  }

  trackSellerPayout(sellerId: string, amount: number): void {
    this.track({
      event: 'seller_payout_requested',
      sellerId,
      value: amount,
    });
  }

  trackProductCreated(productId: string, sellerId: string, category: string): void {
    this.track({
      event: 'product_created',
      productId,
      sellerId,
      properties: {
        category,
      },
    });
  }
}

export const analytics = new AnalyticsTracker();

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${label} took ${duration}ms`);
    }

    return duration;
  }

  static async measureAsync<T>(label: string, operation: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await operation();
      return result;
    } finally {
      this.endTimer(label);
    }
  }
}

// Error tracking utilities
export class ErrorTracker {
  static trackError(error: Error, context?: Record<string, any>): void {
    const errorEvent = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };

    // In a real implementation, you would send this to an error tracking service
    console.error('Tracked error:', errorEvent);
  }

  static trackApiError(endpoint: string, error: Error, userId?: string): void {
    this.trackError(error, {
      type: 'api_error',
      endpoint,
      userId,
    });
  }

  static trackPaymentError(orderId: string, error: Error, userId?: string): void {
    this.trackError(error, {
      type: 'payment_error',
      orderId,
      userId,
    });
  }
}

// Conversion tracking utilities
export class ConversionTracker {
  static trackFunnelStep(step: string, userId?: string, properties?: Record<string, any>): void {
    analytics.track({
      event: `funnel_${step}`,
      userId,
      properties,
    });
  }

  static trackCartAbandonment(userId: string, cartValue: number, itemCount: number): void {
    analytics.track({
      event: 'cart_abandoned',
      userId,
      value: cartValue,
      properties: {
        itemCount,
      },
    });
  }

  static trackCheckoutStep(step: number, userId: string, orderId?: string): void {
    analytics.track({
      event: 'checkout_step',
      userId,
      orderId,
      properties: {
        step,
      },
    });
  }
}