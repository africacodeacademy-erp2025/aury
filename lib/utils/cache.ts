// Simple in-memory cache for server-side caching
// In production, you would use Redis or similar

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Cache key generators
export const CacheKeys = {
  products: (filters?: string) => `products:${filters || 'all'}`,
  product: (id: string) => `product:${id}`,
  userCart: (userId: string) => `cart:${userId}`,
  userOrders: (userId: string, page: number) => `orders:${userId}:${page}`,
  sellerEarnings: (sellerId: string) => `earnings:${sellerId}`,
  featuredProducts: () => 'featured:products',
  recommendations: (productId?: string, userId?: string) => 
    `recommendations:${productId || 'none'}:${userId || 'none'}`,
};

// Cache wrapper for async functions
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  cache.set(key, data, ttl);
  
  return data;
}

// Invalidate related cache entries
export function invalidateCache(pattern: string): void {
  const keys = Array.from(cache['cache'].keys());
  const keysToDelete = keys.filter(key => key.includes(pattern));
  
  keysToDelete.forEach(key => cache.delete(key));
}

// Auto cleanup every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}