import React from "react";

export default function CraftBusinessProductsPage() {
  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Products
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage your craft products and track their performance in the marketplace.
        </p>
      </div>
      
      <div className="text-center py-16">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No products yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start adding your craft products to showcase them in the marketplace.
        </p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Add Your First Product
        </button>
      </div>
    </main>
  );
}