/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin"; // server-only firebase-admin

interface OrderData {
  // Old structure fields
  creatorId?: string;
  customerId: string;
  customerName?: string;
  products?: {
    name: string;
    price: number;
    quantity: number;
    productId: string;
  }[];
  total?: number;
  status?: string;
  
  // New structure fields (Paystack)
  sellerId?: string;
  customerEmail?: string;
  productId?: string;
  productName?: string;
  productType?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;
  paymentProvider?: string;
  paystackReference?: string;
  transactionId?: string;
  sellerName?: string;
  
  createdAt: { toDate: () => Date };
}

export async function GET() {
  try {
    const snapshot = await firebaseDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data() as OrderData;
      
      // Handle both old structure (with products array) and new structure (single product)
      let products: { name: string; price: number; quantity: number }[] = [];
      let total = 0;
      
      if (data.products && Array.isArray(data.products)) {
        // Old structure with products array
        products = data.products.map((p) => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        }));
        total = data.total || 0;
      } else if (data.productName) {
        // New structure with single product fields
        const price = data.amount ? data.amount / 100 : 0; // Convert from cents
        products = [{
          name: data.productName,
          price: price,
          quantity: 1,
        }];
        total = price;
      }

      return {
        id: doc.id,
        customerName: data.customerName || data.customerEmail || 'Customer',
        products: products,
        total: total,
        status: data.status || data.paymentStatus || 'pending',
        currency: data.currency || 'ZAR',
        sellerId: data.sellerId || data.creatorId,
        customerId: data.customerId,
        paymentProvider: data.paymentProvider,
        date: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
