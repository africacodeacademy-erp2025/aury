"use client";

import ProductModal from "@/components/creator/ProductModal";
import { Plus, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User, Camera, TrendingUp, Users, DollarSign, Grid3X3 } from "lucide-react";
import React from "react";

export default function CreatorDashboardPage() {
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('posts'); 

  return (
    <>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Creator Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Welcome back! Here's what's happening with your patterns and community.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Total Patterns
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-500">0</p>
                <p className="text-xs sm:text-sm text-gray-500">No patterns yet</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Followers
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-500">0</p>
                <p className="text-xs sm:text-sm text-gray-500">Start building your audience</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Total Earnings
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-500">R0.00</p>
                <p className="text-xs sm:text-sm text-gray-500">Ready to earn</p>
              </div>
            </div>
          </div>
        </div>

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
            
            {/* Empty state for stories */}
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
              /* Posts Empty State */
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
              /* For Sale Empty State */
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

        {/* Main Content Grid - Only show when there's content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed - Hidden until there's content */}
          <div className="lg:col-span-2 hidden">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Posts
                </h3>
              </div>
              {/* Content should appear here when posts are added */}
            </div>
          </div>

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
                      Start earning from your craft
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Set prices for your patterns and tutorials
                    </p>
                  </div>
                </div>
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

