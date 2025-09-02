/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { addComment, getComments, toggleLike } from '@/lib/actions/community.action';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [liked, setLiked] = useState(!!post.liked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  const formatTimestamp = (timestamp: any) => {
    try {
      // Handle Firestore timestamp
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Recently';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Author Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
          {getInitials(post.authorName)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {post.authorName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimestamp(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {post.content}
        </p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={1200}
              height={800}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
      </div>

      {/* Engagement Section */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-4">
            <button
              onClick={async () => {
                const res = await toggleLike(post.id);
                if (res.success) {
                  setLiked(!!res.liked);
                  setLikesCount(res.likesCount ?? likesCount);
                }
              }}
              className={`transition-colors cursor-pointer ${liked ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              {liked ? 'Liked' : 'Like'} • {likesCount}
            </button>

            <button
              onClick={async () => {
                const next = !showComments;
                setShowComments(next);
                if (next && comments.length === 0) {
                  setLoadingComments(true);
                  const res = await getComments(post.id);
                  if (res.success && res.comments) setComments(res.comments);
                  setLoadingComments(false);
                }
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Comment • {post.commentsCount ?? 0}
            </button>

            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                  // Simple inline feedback; could use toast if available here
                } catch {}
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Share
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border rounded-md px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              />
              <button
                disabled={submittingComment || commentText.trim().length === 0}
                onClick={async () => {
                  setSubmittingComment(true);
                  const res = await addComment(post.id, commentText);
                  if (res.success && res.comment) {
                    setComments((c) => [res.comment!, ...c]);
                    setCommentText('');
                  }
                  setSubmittingComment(false);
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>

            {loadingComments ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{c.authorName}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">{c.text}</div>
                    <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}