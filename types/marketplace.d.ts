/* eslint-disable @typescript-eslint/no-explicit-any */
// Marketplace-specific types extending the existing types

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
  sellerId: string;
  sellerName: string;
  productType: 'pattern' | 'physical';
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  sellerId: string;
  sellerName: string;
  productType: 'pattern' | 'physical';
  downloadUrl?: string; // For digital patterns
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface SellerEarnings {
  id: string;
  sellerId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalSales: number;
  totalOrders: number;
  commissionRate: number;
  lastPayoutAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  orderId: string;
  sellerId: string;
  amount: number;
  commission: number;
  netAmount: number;
  type: 'sale' | 'refund' | 'payout';
  status: 'pending' | 'completed' | 'failed';
  paymentIntentId?: string;
  payoutId?: string;
  createdAt: string;
  processedAt?: string;
}

interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  paymentDetails: Record<string, any>;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

interface ProductAnalytics {
  productId: string;
  views: number;
  likes: number;
  cartAdds: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  lastUpdated: string;
}

// API Response Types
interface CreateOrderResult {
  success: boolean;
  message?: string;
  order?: Order;
  clientSecret?: string; // For Stripe payment
}

interface GetOrdersResult {
  success: boolean;
  message?: string;
  orders?: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface CartResult {
  success: boolean;
  message?: string;
  cart?: Cart;
}

interface EarningsResult {
  success: boolean;
  message?: string;
  earnings?: SellerEarnings;
  transactions?: Transaction[];
}

interface PayoutResult {
  success: boolean;
  message?: string;
  payout?: Payout;
}

// Search and Filter Types
interface MarketplaceSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerType?: 'creator' | 'craft-business';
  sellerId?: string;
  productType?: 'pattern' | 'physical';
  tags?: string[];
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

interface SearchResult {
  success: boolean;
  message?: string;
  products?: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters?: {
    categories: string[];
    priceRange: { min: number; max: number };
    sellers: { id: string; name: string; type: string }[];
  };
}