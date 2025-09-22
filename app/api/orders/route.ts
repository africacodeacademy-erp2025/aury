/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin"; // server-only firebase-admin

interface OrderData {
  creatorId: string;
  customerId: string;
  customerName: string;
  products: {
    name: string;
    price: number;
    quantity: number;
    productId: string;
  }[];
  total: number;
  status: string;
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
      return {
        id: doc.id,
        customerName: data.customerName,
        products: data.products.map((p) => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        })),
        total: data.total,
        status: data.status,
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
