/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { firebaseAuth } from "@/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";

interface ProductItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  products?: ProductItem[];
  total?: number;
  status?: string;
  date?: string | number; // timestamp from Firestore
  sellerId?: string;
}

export default function EarningsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        
        // Filter orders to only show current seller's orders
        const sellerOrders = data.orders.filter((o: any) => 
          o.sellerId === user.uid
        );
        
        setOrders(
          sellerOrders.map((o: any) => ({
            id: o.id,
            customerName: o.customerName,
            products: o.products || [],
            total: o.total || 0,
            status: o.status || "Pending",
            sellerId: o.sellerId,
            date: o.date || new Date().toISOString(),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Earnings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Track your earnings from pattern sales and community engagement.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Earnings
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            R{orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            This Month
          </h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            R{orders
              .filter(
                (o) =>
                  o.date !== undefined &&
                  new Date(o.date).getMonth() === new Date().getMonth()
              )
              .reduce((sum, o) => sum + (o.total || 0), 0)
              .toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Patterns Sold
          </h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {orders.reduce(
              (sum, o) =>
                sum +
                (o.products?.reduce((ps, p) => ps + (p.quantity || 0), 0) || 0),
              0
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total sales</p>
        </div>
      </div>

      {/* Orders Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Orders
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start earning
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your first pattern to start earning from your crochet expertise.
            </p>
            <a
              href="/patterns"
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Product
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-xl">
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Buyer</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">{order.id}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">
                      {order.products?.map((p) => `${p.name} x${p.quantity}`).join(", ")}
                    </td>
                    <td className="px-6 py-4">R{(order.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{order.status}</td>
                    <td className="px-6 py-4">
                      {order.date ? new Date(order.date).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
