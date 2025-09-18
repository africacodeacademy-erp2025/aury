'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { addComment, getComments, toggleLike } from '@/lib/actions/community.action';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { firebaseAuth } from '@/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Post, PostComment } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [liked, setLiked] = useState(!!post.liked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followAnimating, setFollowAnimating] = useState(false);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!currentUser?.uid || !post.authorId) return;
      try {
        const res = await fetch(`/api/checkFollowing?userId=${currentUser.uid}&authorId=${post.authorId}`);
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error('Error checking following:', err);
      }
    };
    checkFollowing();
  }, [currentUser, post.authorId]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]?.toUpperCase()).join('');

  const formatTimestamp = (timestamp: Date | { toDate: () => Date }) => {
    try {
      const date = 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleLike = async () => {
    const originalLiked = liked;
    const originalCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try {
      const result = await toggleLike(post.id);
      if (result.success) {
        setLiked(!!result.liked);
        setLikesCount(result.likesCount ?? 0);
      } else {
        setLiked(originalLiked);
        setLikesCount(originalCount);
        toast.error('Failed to update like');
      }
    } catch {
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
        if (result.success && result.comments) setComments(result.comments);
      } catch {
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
        setComments(prev => [result.comment as PostComment, ...prev]);
        setCommentText('');
        toast.success('Comment added!');
      } else {
        toast.error('Failed to add comment');
      }
    } catch {
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
          toast.success('Link copied!');
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error('Failed to copy link');
        }
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.content.slice(0, 100))}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    setShowShareMenu(false);
  };

  const handleFollow = async () => {
    if (!currentUser?.uid || !post.authorId) return;

    setFollowAnimating(true);

    try {
      const res = await fetch('/api/updateFollowStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid, authorId: post.authorId, follow: !isFollowing }),
      });
      const data = await res.json();

      if (data.success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? `Unfollowed ${post.authorName}` : `Following ${post.authorName}`);
      } else {
        toast.error('Failed to update follow status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update follow status');
    } finally {
      setTimeout(() => setFollowAnimating(false), 500);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Author Info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 relative">
          <div className="relative h-10 w-10 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold">
            {getInitials(post.authorName)}
            {currentUser?.uid !== post.authorId && (
              <button
                onClick={handleFollow}
                className={`
                  absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow-lg
                  transform transition-transform duration-300
                  ${followAnimating ? 'scale-125' : 'scale-100'}
                  ${isFollowing ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}
                `}
              >
                {isFollowing ? <Check className="h-3 w-3" /> : '+'}
              </button>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{post.authorName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimestamp(post.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 space-y-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative">
          <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="w-full h-auto object-cover" />
        </div>
      )}

      {/* Engagement Section */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                ${liked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                ${showComments ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{post.commentsCount ?? 0}</span>
            </button>
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[160px]">
                <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Share on X
                </button>
                <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Share on Facebook
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-start space-x-3">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !commentText.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
