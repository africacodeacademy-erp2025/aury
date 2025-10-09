"use client";

import React, { useEffect, useState } from "react";
import ProductModal from "@/components/creator/ProductModal";
import PaystackConnectStatus from "@/components/creator/PaystackConnectStatus";
import {
  Plus,
  Camera,
  TrendingUp,
  Users,
  DollarSign,
  Package,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, firebaseDb } from "@/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import type { Product, Follower, Order, User } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DashboardPost {
  id: string;
  imageUrl?: string;
  caption: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  // -------------------------------
  // Fetch all dashboard data
  // -------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const uid = user.uid;
      setUserId(uid);
      setLoading(true);

      try {
        // ---------- User Data ----------
        const userDoc = await getDoc(doc(firebaseDb, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Only extract serializable fields, exclude Firestore timestamps and complex objects
          setUser({
            id: uid,
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "creator",
            stripeAccountId: userData.stripeAccountId,
            stripeOnboardingComplete: userData.stripeOnboardingComplete,
            paystackSubaccountCode: userData.paystackSubaccountCode,
            paystackSubaccountId: userData.paystackSubaccountId,
            paystackOnboardingComplete: userData.paystackOnboardingComplete || false,
            paymentProvider: userData.paymentProvider || 'paystack',
            // Don't include: followers, following, updatedAt, createdAt, or any Firestore timestamps
          });
          setFollowers(userData.followers || []);
        }

        // ---------- Products ----------
        const productsSnap = await getDocs(
          query(
            collection(firebaseDb, "products"),
            where("creatorId", "==", uid)
          )
        );
        setItems(
          productsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
        );

        // ---------- Posts ----------
        const postsSnap = await getDocs(
          query(
            collection(firebaseDb, "posts"),
            where("creatorId", "==", uid),
            orderBy("createdAt", "desc")
          )
        );
        setPosts(
          postsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as DashboardPost[]
        );

        // ---------- Followers (from user document) ----------
        // Already loaded above with user data

        // ---------- Orders ----------
        const ordersSnap = await getDocs(
          query(
            collection(firebaseDb, "orders"),
            where("creatorId", "==", uid),
            orderBy("createdAt", "desc")
          )
        );
        const ordersData = ordersSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            total: data.total ?? 0,
            status: data.status ?? "Pending",
            createdAt: data.createdAt ?? { toDate: () => new Date() },
          } as Order;
        });
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        alert(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------
  // Product Handlers
  // -------------------------------
  const handleEditProduct = (item: Product) => {
    setEditingItem(item);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (itemId: string) => {
    if (!userId || !confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await fetch(`/api/${userId}/items/${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Delete product error:", err);
      alert("Failed to delete product");
    }
  };

  const handleProductSuccess = (newProduct?: Product) => {
    if (!newProduct) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === newProduct.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newProduct;
        return updated;
      }
      return [newProduct, ...prev];
    });
    setIsProductModalOpen(false);
    setEditingItem(null);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">Loading dashboard...</p>
    );

  const totalEarnings = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);

  return (
    <>
      <main className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Creator Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Welcome back! Manage your patterns, posts, and community engagement.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Patterns
              </h3>
              <p className="text-3xl font-bold text-blue-500">{items.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border flex items-center gap-4">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Followers
              </h3>
              <p className="text-3xl font-bold text-purple-500">
                {followers.length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Earnings
              </h3>
              <p className="text-3xl font-bold text-green-500">
                P{totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border flex items-center gap-4">
            <Package className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <p className="text-3xl font-bold text-yellow-500">
                {orders.length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Posts
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {posts.length === 0 && (
                  <p className="text-gray-500 col-span-2">No posts yet.</p>
                )}
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="relative group overflow-hidden rounded-lg aspect-square"
                  >
                    <Image
                      src={post.imageUrl ?? ""}
                      alt={post.caption}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <p className="text-white text-sm text-center px-2">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border mt-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Products
                </h3>
                {items.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsProductModalOpen(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Your First Product
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden rounded-lg border p-2"
                  >
                    <Image
                      src={item.imageUrl ?? ""}
                      alt={item.name}
                      width={900}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      P{item.price}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded"
                        onClick={() => handleEditProduct(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                        onClick={() => handleDeleteProduct(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Snapshot */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border mt-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h3>
                <a
                  href="/creator/earnings"
                  className="text-blue-500 text-sm hover:underline"
                >
                  View all
                </a>
              </div>
              <div className="p-4 space-y-4">
                {orders.length === 0 && (
                  <p className="text-gray-500">No orders yet.</p>
                )}
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: P{order.total}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: {order.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Paystack Connect Status */}
            {user && <PaystackConnectStatus user={user} />}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push("/patterns/generate");
                  }}
                  className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-5 w-5" />
                  Generate Pattern
                </button>
                <button className="w-full flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200">
                  <Camera className="h-5 w-5" />
                  Create Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSuccess={handleProductSuccess}
      />
    </>
  );
}
