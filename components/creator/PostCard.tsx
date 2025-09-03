/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { addComment, getComments, toggleLike } from '@/lib/actions/community.action';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
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

  const handleLike = async () => {
    const originalLiked = liked;
    const originalCount = likesCount;
    
    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    
    try {
      const result = await toggleLike(post.id);
      if (result.success) {
        setLiked(!!result.liked);
        setLikesCount(result.likesCount ?? 0);
      } else {
        // Revert on error
        setLiked(originalLiked);
        setLikesCount(originalCount);
        toast.error('Failed to update like');
      }
    } catch (error) {
      // Revert on error
      setLiked(originalLiked);
      setLikesCount(originalCount);
      toast.error('Failed to update like');
    }
  };

  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    
    if (nextShow && comments.length === 0) {
      setLoadingComments(true);
      try {
        const result = await getComments(post.id);
        if (result.success && result.comments) {
          setComments(result.comments);
        }
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const result = await addComment(post.id, commentText.trim());
      if (result.success && result.comment) {
        setComments(prev => [result.comment!, ...prev]);
        setCommentText('');
        toast.success('Comment added!');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (type: 'copy' | 'twitter' | 'facebook') => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    switch (type) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          toast.error('Failed to copy link');
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.content.slice(0, 100))}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    setShowShareMenu(false);
  };
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Author Info */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-100 dark:border-gray-700">
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
      <div className="p-4 space-y-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative">
          <Image
            src={post.imageUrl}
            alt="Post image"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Engagement Section */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                ${liked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }
              `}
              aria-label={liked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={handleToggleComments}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                ${showComments 
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }
              `}
              aria-label="Toggle comments"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{post.commentsCount ?? 0}</span>
            </button>
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 
                       hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-200"
              aria-label="Share post"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[160px]">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Share on X
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
            {/* Add Comment */}
            <div className="flex items-start space-x-3">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                         border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !commentText.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium 
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>

            {/* Comments List */}
            {loadingComments ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex space-x-3">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="flex space-x-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-white text-sm font-medium">
                      {getInitials(c.authorName)}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {c.authorName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}