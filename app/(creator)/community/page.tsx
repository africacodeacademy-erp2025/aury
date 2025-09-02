import CommunityFeed from '@/components/creator/CommunityFeed';
import PostForm from '@/components/creator/PostForm';
import React from 'react';

export default function CommunityPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Creator Community
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Share your latest projects and connect with fellow creators
        </p>
      </div>

      <PostForm />
      <CommunityFeed />
    </main>
  );
}