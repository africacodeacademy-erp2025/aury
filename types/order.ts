// src/types/order.ts
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  // Support both old and new field names
  creatorId?: string;
  sellerId?: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  
  // Support both product array and single product fields
  products?: Product[];
  productId?: string;
  productName?: string;
  productType?: string;
  
  // Amount and currency
  total?: number;
  amount?: number;
  currency?: string;
  
  // Status
  status?: string;
  paymentStatus?: string;
  
  // Payment details
  paymentProvider?: string;
  paystackReference?: string;
  transactionId?: string;
  sellerName?: string;
  
  createdAt: Timestamp; // Firestore timestamp
}

