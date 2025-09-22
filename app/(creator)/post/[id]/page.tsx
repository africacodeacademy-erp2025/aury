import React from 'react';
import { getPostById } from '@/lib/actions/community.action';
import PostCard from '@/components/creator/PostCard';

export default async function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPostById(id);

  if (!result.success || !result.post) {
    return (
      <main className="mx-auto max-w-3xl p-6">
  <p className="text-gray-600 dark:text-gray-300">Post not found or you don&apos;t have access.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post</h1>
      <PostCard
        post={{
          ...result.post,
          imageUrl: result.post.imageUrl ?? undefined,
          createdAt: result.post.createdAt ? new Date(result.post.createdAt) : new Date(),
        }}
      />
    </main>
  );
}
