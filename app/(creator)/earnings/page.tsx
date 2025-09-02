import React from "react";

export default function EarningsPage() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Track your earnings from pattern sales and community engagement.
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">$0.00</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">This Month</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">$0.00</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">January 2025</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patterns Sold</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total sales</p>
        </div>
      </div>
      
      <div className="mt-8 text-center py-12">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start earning
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your first pattern to start earning from your crochet expertise.
        </p>
      </div>
    </main>
  );
}