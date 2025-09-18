'use client';

import React, { useEffect, useState, useRef } from 'react';
import PostCard from './PostCard';
import { Post } from '@/types/post';

interface MansoryGridProps {
  posts: Post[];
  loading?: boolean;
}

export default function MansoryGrid({ posts, loading }: MansoryGridProps) {
  const [columns, setColumns] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);      // mobile
      else if (width < 1024) setColumns(2); // tablet
      else if (width < 1536) setColumns(3); // desktop
      else setColumns(4);                   // large desktop
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute posts across columns
  const distributePostsToColumns = () => {
    const columnArrays: Post[][] = Array.from({ length: columns }, () => []);
    posts.forEach((post, index) => {
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(post);
    });
    return columnArrays;
  };

  const columnArrays = distributePostsToColumns();

  if (loading) {
    return (
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="space-y-6">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                style={{ height: '250px' }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to share something with the community!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid gap-6 auto-rows-max"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {columnArrays.map((columnPosts, columnIndex) => (
        <div key={columnIndex} className="space-y-6">
          {columnPosts.map((post, postIndex) => (
            <div
              key={post.id}
              className="animate-fadeIn"
              style={{
                animationDelay: `${(columnIndex * 100) + (postIndex * 50)}ms`,
                animationFillMode: 'both',
              }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
