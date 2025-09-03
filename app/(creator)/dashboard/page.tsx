import React from "react";

export default function CreatorDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Creator Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome to your dashboard. Manage your patterns, track earnings, and more.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Patterns</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Community Posts</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>

              <span className="font-medium text-green-600">R0.00</span>


            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Activity</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No recent activity. Start creating patterns or engaging with the community!
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Getting Started</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Upload your first pattern</li>
            <li>• Share a community post</li>
            <li>• Connect with other creators</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
