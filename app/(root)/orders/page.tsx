"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { firebaseDb, firebaseAuth } from "@/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import type { Order, Product } from "@/types/order";
import { User } from "@/types";
import { getCurrentUser } from "@/lib/actions/auth.action";

const statusColors: Record<string, string> = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
  Processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
  Shipped:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
};

export default function OrdersPage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Listen for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch orders - either as seller or customer
  const fetchOrders = async () => {
    if (!firebaseUser?.uid || !user) return;

    try {
      let q;

      // If creator or craft-business, fetch orders where they are the seller
      if (user.role === "creator" || user.role === "craft-business") {
        q = query(
          collection(firebaseDb, "orders"),
          where("sellerId", "==", firebaseUser.uid),
          orderBy("createdAt", "desc")
        );
      } else {
        // If customer, fetch orders where they are the customer
        q = query(
          collection(firebaseDb, "orders"),
          where("customerId", "==", firebaseUser.uid),
          orderBy("createdAt", "desc")
        );
      }

      const snapshot = await getDocs(q);
      const ordersData: Order[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      );
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser && user) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, user]);

  // Update order status (only for sellers)
  const handleStatusChange = async (orderId: string, status: string) => {
    if (!user || user.role === "customer") {
      toast.error("Only sellers can update order status");
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      const docRef = doc(firebaseDb, "orders", orderId);
      await updateDoc(docRef, { status });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading orders...</p>;

  if (!orders.length) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">
          {user?.role === "customer" ? "My Orders" : "Orders Dashboard"}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {user?.role === "customer"
              ? "You haven't made any purchases yet."
              : "No orders yet."}
          </p>
        </div>
      </div>
    );
  }

  // Header stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;
  const isSeller = user?.role === "creator" || user?.role === "craft-business";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">
        {isSeller ? "Orders Dashboard" : "My Orders"}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Orders
          </p>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Pending
          </p>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-green-800 dark:text-green-200">
            Completed
          </p>
          <p className="text-2xl font-semibold">{completedOrders}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <div>
                <p className="font-medium text-lg">
                  {isSeller
                    ? order.customerName || order.customerEmail || "Customer"
                    : order.sellerName || "Seller"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order ID: {order.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created:{" "}
                  {order.createdAt?.toDate?.().toLocaleString() || "N/A"}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status ?? ""] ||
                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {order.status || order.paymentStatus || "Pending"}
                </span>
                {isSeller && (
                  <select
                    value={order.status || order.paymentStatus || "Pending"}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    disabled={updatingOrderId === order.id}
                    className="border px-3 py-1 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {[
                      "Pending",
                      "Processing",
                      "Shipped",
                      "Completed",
                      "Cancelled",
                    ].map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="px-2 py-2">Product</th>
                    <th className="px-2 py-2">Quantity</th>
                    <th className="px-2 py-2">Price</th>
                    <th className="px-2 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Check if products array exists, otherwise show single product */}
                  {order.products && order.products.length > 0 ? (
                    order.products.map((prod: Product, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-2 py-2">{prod.name}</td>
                        <td className="px-2 py-2">{prod.quantity || 1}</td>
                        <td className="px-2 py-2">
                          {order.currency || "R"} {prod.price}
                        </td>
                        <td className="px-2 py-2">
                          {order.currency || "R"}{" "}
                          {prod.price * (prod.quantity || 1)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-2 py-2">
                        {order.productName || "Product"}
                      </td>
                      <td className="px-2 py-2">1</td>
                      <td className="px-2 py-2 " colSpan={2}>
                        {order.currency}{" "}
                        {((order.amount || 0) / 100).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={3}
                      className="px-2 py-2 font-medium text-right"
                    >
                      Total:
                    </td>
                    <td className="px-2 py-2 font-medium">
                      {order.currency || "ZAR"}{" "}
                      {order.total
                        ? order.total
                        : ((order.amount || 0) / 100).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
