/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ProductModal from "@/components/creator/ProductModal";
import { Plus, Camera, TrendingUp, Users, DollarSign } from "lucide-react";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, firebaseDb } from "@/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreatorDashboardPage() {
  const router = useRouter();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Profile state
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    contact: "",
    logoUrl: "",
  });

  // Dashboard data
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [patternsCount, setPatternsCount] = useState(0);
  const [earnings, setEarnings] = useState("P0.00");
  const [storiesCount, setStoriesCount] = useState(0);

  // Load profile and stats
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      if (!authUser) {
        setLoadingProfile(false);
        return;
      }
      setUser(authUser);
      setUserId(authUser.uid);

      try {
        // Fetch profile
        const userRef = doc(firebaseDb, "creators", authUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setFormData(snap.data() as any);

        // Fetch dashboard data (counts only)
        const postsRes = await fetch(`/api/${authUser.uid}/posts`);
        const itemsRes = await fetch(`/api/${authUser.uid}/items`);
        const followersRes = await fetch(`/api/${authUser.uid}/followers`);

        if (postsRes.ok) setPostsCount((await postsRes.json()).length);
        if (itemsRes.ok) setPatternsCount((await itemsRes.json()).length);
        if (followersRes.ok) setFollowersCount((await followersRes.json()).length);

        // Placeholder: earnings & stories
        setEarnings("P0.00");
        setStoriesCount(0);
      } catch (err) {
        console.error("Error loading profile/dashboard data:", err);
      } finally {
        setLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const userRef = doc(firebaseDb, "creators", user.uid);
      await setDoc(userRef, formData, { merge: true });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Creator Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Welcome back! Here&apos;s what&apos;s happening with your patterns and community.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Total Patterns
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-500">{patternsCount}</p>
                <p className="text-xs sm:text-sm text-gray-500">Manage your designs</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Followers
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-500">{followersCount}</p>
                <p className="text-xs sm:text-sm text-gray-500">Your audience</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Total Earnings
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-500">{earnings}</p>
                <p className="text-xs sm:text-sm text-gray-500">Ready to earn</p>
              </div>
            </div>
          </div>
        </div>

        {/* === EDIT PROFILE BUTTON SECTION === */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{formData.name || "Your Name"}</p>
              <p className="text-gray-500 dark:text-gray-300">{formData.contact || "Contact Info"}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/profile/edit")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Edit Profile
          </button>
        </div>

        {/* === ORIGINAL DASHBOARD SECTIONS START === */}
        {/* Stories Section */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stories
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="relative ring-2 ring-gray-300 dark:ring-gray-600 rounded-full p-0.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Plus className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center w-14 sm:w-16 truncate">
                Your Story
              </span>
            </div>

            <div className="flex items-center justify-center flex-1 min-h-[80px]">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Connect with other creators to see their stories here
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <div className="w-3 h-3 grid grid-cols-3 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                <span className="text-sm font-medium">POSTS</span>
              </button>
              <button
                onClick={() => setActiveTab('forsale')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'forsale'
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">FOR SALE</span>
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="p-4 sm:p-6">
            {activeTab === 'posts' ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Share your first post
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
                  When you share photos and videos of your patterns, they will appear here.
                </p>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Start selling your patterns
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
                  Add your first crochet or knitting pattern to start earning from your creativity.
                </p>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Add your first pattern
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 xl:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Add New Pattern
                </button>
                <button className="w-full flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  Create Story
                </button>
              </div>
            </div>

            {/* Getting Started Tips */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Getting Started
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      Upload your first pattern
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Share your crochet or knitting designs with the community
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      Connect with other creators
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Follow and engage with the crafting community
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      Start earning
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Sell your patterns and grow your income
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Modal */}
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={() => setIsProductModalOpen(false)}
        />
      </main>
    </>
  );
}
