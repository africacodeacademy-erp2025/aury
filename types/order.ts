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
  creatorId: string;
  customerId: string;
  customerName: string;
  products: Product[];
  total: number;
  status: string;
  createdAt: Timestamp; // Firestore timestamp
}
