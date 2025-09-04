import CommunityFeed from '@/components/creator/CommunityFeed';
import React from 'react';

export default function CraftBusinessCommunityPage() {
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Craft Business Community
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Connect with other craft businesses and share your latest products
        </p>
      </div>

      <CommunityFeed />
    </main>
  );
}