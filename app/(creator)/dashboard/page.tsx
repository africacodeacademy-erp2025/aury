"use client";

import React, { useState, useEffect } from "react";
import ProductModal from "@/components/creator/ProductModal";
import { Plus, Heart, MessageCircle, Share, User, Camera, TrendingUp, Users, DollarSign, MoreHorizontal } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: any;
  likes?: number;
  comments?: number;
}

interface Item {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface Follower {
  id: string;
  username: string;
  photoURL?: string;
}

export default function CreatorDashboardPage() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.uid);

      try {
        // Fetch posts
        const postsSnap = await getDocs(query(collection(db, "users", user.uid, "posts"), orderBy("createdAt", "desc"), limit(10)));
        const postsData = postsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Post[];
        setPosts(postsData);

        // Fetch items/products
        const itemsSnap = await getDocs(query(collection(db, "users", user.uid, "items"), orderBy("createdAt", "desc")));
        const itemsData = itemsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Item[];
        setItems(itemsData);

        // Fetch followers
        const followersSnap = await getDocs(collection(db, "users", user.uid, "followers"));
        const followersData = followersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Follower[];
        setFollowers(followersData);
      } catch (err) {
        console.error("Error fetching creator data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Patterns</h3>
              <p className="text-3xl font-bold text-blue-500">{items.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Followers</h3>
              <p className="text-3xl font-bold text-purple-500">{followers.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-500">R0.00</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Posts
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {posts.length === 0 && <p className="text-gray-500 col-span-2">No posts yet.</p>}
                {posts.map((post) => (
                  <div key={post.id} className="relative group overflow-hidden rounded-lg aspect-square">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <p className="text-white text-sm text-center px-2">{post.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-5 w-5" />
                  Add New Pattern
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
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  );
}
