import { z } from 'zod';

// Product validation schemas
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(10000, 'Price must be less than R10,000'),
  originalPrice: z.number().min(0).max(10000).optional(),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  stock: z.number().min(0).optional(),
  materials: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
});

// Cart validation schemas
export const AddToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
});

// Order validation schemas
export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    productName: z.string(),
    sellerId: z.string(),
    sellerName: z.string(),
    productType: z.enum(['pattern', 'physical']),
  })).min(1, 'Cart cannot be empty'),
  shippingAddress: ShippingAddressSchema.optional(),
});

// Payment validation schemas
export const PaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
});

// Payout validation schemas
export const PayoutRequestSchema = z.object({
  amount: z.number().min(100, 'Minimum payout amount is R100').max(50000, 'Maximum payout amount is R50,000'),
  paymentMethod: z.enum(['bank_transfer', 'paypal', 'stripe']),
  paymentDetails: z.object({
    accountNumber: z.string().optional(),
    bankCode: z.string().optional(),
    accountHolderName: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

// Search validation schemas
export const SearchProductsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sellerType: z.enum(['creator', 'craft-business']).optional(),
  sellerId: z.string().optional(),
  productType: z.enum(['pattern', 'physical']).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'rating']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
});

// Utility functions for validation
export function validateProductData(data: unknown) {
  return CreateProductSchema.safeParse(data);
}

export function validateCartItem(data: unknown) {
  return AddToCartSchema.safeParse(data);
}

export function validateOrderData(data: unknown) {
  return CreateOrderSchema.safeParse(data);
}

export function validatePaymentIntent(data: unknown) {
  return PaymentIntentSchema.safeParse(data);
}

export function validatePayoutRequest(data: unknown) {
  return PayoutRequestSchema.safeParse(data);
}

export function validateSearchParams(data: unknown) {
  return SearchProductsSchema.safeParse(data);
}

// Security utilities
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function validateImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

export function calculateCommission(amount: number, rate: number = 0.05): number {
  return Math.round(amount * rate * 100) / 100;
}

export function calculateTax(amount: number, rate: number = 0.15): number {
  return Math.round(amount * rate * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}