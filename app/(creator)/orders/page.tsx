'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { firebaseDb, firebaseAuth } from '@/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Order, Product } from '@/types/order';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Listen for logged-in creator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fetch orders for this creator
  const fetchOrders = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(firebaseDb, 'orders'),
        where('creatorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ordersData: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // Update order status
  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const docRef = doc(firebaseDb, 'orders', orderId);
      await updateDoc(docRef, { status });
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? { ...order, status } : order))
      );
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading orders...</p>;
  if (!orders.length) return <p className="p-6 text-center text-gray-500">No orders yet.</p>;

  // Header stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Orders Dashboard</h1>

      {/* Stats */}
      <div className="flex space-x-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex-1 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4 flex-1 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">Pending</p>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4 flex-1 text-center">
          <p className="text-sm text-green-800 dark:text-green-200">Completed</p>
          <p className="text-2xl font-semibold">{completedOrders}</p>
        </div>
      </div>

      {/* Orders List */}
      {orders.map(order => (
        <div
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium text-lg">{order.customerName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order ID: {order.id}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {order.createdAt?.toDate?.().toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
              <select
                value={order.status}
                onChange={e => handleStatusChange(order.id, e.target.value)}
                disabled={updatingOrderId === order.id}
                className="mt-2 border px-3 py-1 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                {['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(
                  statusOption => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="px-2 py-1">Product</th>
                  <th className="px-2 py-1">Quantity</th>
                  <th className="px-2 py-1">Price</th>
                  <th className="px-2 py-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((prod: Product, index: number) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{prod.name}</td>
                    <td className="px-2 py-1">{prod.quantity}</td>
                    <td className="px-2 py-1">${prod.price}</td>
                    <td className="px-2 py-1">${prod.price * prod.quantity}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="px-2 py-2 font-medium text-right">
                    Total:
                  </td>
                  <td className="px-2 py-2 font-medium">${order.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
