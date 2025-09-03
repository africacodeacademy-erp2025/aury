import React from "react";

export default function PatternsPage() {
  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Patterns
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage your crochet patterns and track their performance.
        </p>
      </div>
      
      <div className="text-center py-16">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No patterns yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start creating and uploading your crochet patterns to share with the community.
        </p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Upload Your First Pattern
        </button>
      </div>
    </main>
  );
}