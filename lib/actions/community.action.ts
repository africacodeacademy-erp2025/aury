/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';
import { AddCommentResult, CreatePostParams, GetCommentsResult, Post, PostComment, ToggleLikeResult } from '@/types';

export async function createPost(params: CreatePostParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to create a post',
      };
    }

    if (user.role !== 'creator' && user.role !== 'craft-business') {
      return {
        success: false,
        message: 'Only creators and craft businesses can create posts',
      };
    }

    const { content, imageUrl } = params;

    if (!content.trim()) {
      return {
        success: false,
        message: 'Post content is required',
      };
    }

    const postData = {
      content: content.trim(),
      imageUrl: imageUrl || null,
      authorId: user.id,
      authorName: user.name,
      authorEmail: user.email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firebaseDb.collection('posts').add(postData);

    return {
      success: true,
      postId: docRef.id,
      message: 'Post created successfully',
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      message: 'Failed to create post. Please try again.',
    };
  }
}

export async function getPosts() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to view posts',
        posts: [],
      };
    }

    if (user.role !== 'creator' && user.role !== 'craft-business') {
      return {
        success: false,
        message: 'Only creators and craft businesses can view community posts',
        posts: [],
      };
    }

    const postsSnapshot = await firebaseDb
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(50) // Pagination for performance
      .get();

    // Preload likes by this user for marking 'liked'
    const likesSnapshot = await firebaseDb
      .collection('likes')
      .where('userId', '==', user.id)
      .get();
    const likedPostIds = new Set(likesSnapshot.docs.map((d) => (d.data() as any).postId as string));

    // Aggregate counts for likes and comments for each post
    const posts: Post[] = await Promise.all(postsSnapshot.docs.map(async (doc) => {
      const data = doc.data() as Record<string, unknown>;
      const createdAt = (data?.createdAt as any)?.toDate ? (data as any).createdAt.toDate().toISOString() : null;
      const updatedAt = (data?.updatedAt as any)?.toDate ? (data as any).updatedAt.toDate().toISOString() : null;

      const [likesCountSnap, commentsCountSnap] = await Promise.all([
        firebaseDb.collection('likes').where('postId', '==', doc.id).count().get(),
        firebaseDb.collection('comments').where('postId', '==', doc.id).count().get(),
      ]);

      return {
        id: doc.id,
        content: data.content as string,
        imageUrl: (data.imageUrl as string) || null,
        authorId: data.authorId as string,
        authorName: data.authorName as string,
        authorEmail: data.authorEmail as string,
        createdAt,
        updatedAt,
        likesCount: likesCountSnap.data().count || 0,
        commentsCount: commentsCountSnap.data().count || 0,
        liked: likedPostIds.has(doc.id),
      } as Post;
    }));

    return {
      success: true,
      posts,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      message: 'Failed to load posts. Please try again.',
      posts: [],
    };
  }
}

export async function uploadImage(file: File) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to upload images',
      };
    }

  // Convert file to base64 for storage in Firestore (server-side)
  // Note: In production, you'd want to use Firebase Storage instead
  const ab = await file.arrayBuffer();
  const base64Body = Buffer.from(new Uint8Array(ab)).toString('base64');
  const base64 = `data:${file.type};base64,${base64Body}`;

    // Store image metadata in Firestore
    const imageData = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      base64Data: base64,
      uploadedBy: user.id,
      uploadedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firebaseDb.collection('images').add(imageData);

    // Return the base64 data URL for immediate use
    return {
      success: true,
      url: base64,
      imageId: docRef.id,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      message: 'Failed to upload image. Please try again.',
    };
  }
}

export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: 'Not authenticated' };

    const likeQuery = await firebaseDb
      .collection('likes')
      .where('postId', '==', postId)
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    let liked = false;
    if (!likeQuery.empty) {
      // Unlike
      await likeQuery.docs[0].ref.delete();
      liked = false;
    } else {
      // Like
      await firebaseDb.collection('likes').add({
        postId,
        userId: user.id,
        createdAt: FieldValue.serverTimestamp(),
      });
      liked = true;
    }

    const likesCountSnap = await firebaseDb.collection('likes').where('postId', '==', postId).count().get();
    return { success: true, liked, likesCount: likesCountSnap.data().count || 0 };
  } catch (e) {
    console.error('toggleLike error', e);
    return { success: false, message: 'Failed to toggle like' };
  }
}

export async function addComment(postId: string, text: string): Promise<AddCommentResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: 'Not authenticated' };
    const trimmed = text.trim();
    if (!trimmed) return { success: false, message: 'Comment cannot be empty' };

    const ref = await firebaseDb.collection('comments').add({
      postId,
      text: trimmed,
      authorId: user.id,
      authorName: user.name,
      createdAt: FieldValue.serverTimestamp(),
    });

    const doc = await ref.get();
    const data = doc.data() as any;
    const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    return {
      success: true,
      comment: {
        id: doc.id,
        postId,
        text: trimmed,
        authorId: user.id,
        authorName: user.name,
        createdAt,
      },
    };
  } catch (e) {
    console.error('addComment error', e);
    return { success: false, message: 'Failed to add comment' };
  }
}

export async function getComments(postId: string): Promise<GetCommentsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: 'Not authenticated', comments: [] };

    const snap = await firebaseDb
      .collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const comments: PostComment[] = snap.docs.map((d) => {
      const data = d.data() as any;
      const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
      return {
        id: d.id,
        postId,
        text: data.text as string,
        authorId: data.authorId as string,
        authorName: data.authorName as string,
        createdAt,
      };
    });

    return { success: true, comments };
  } catch (e) {
    console.error('getComments error', e);
    return { success: false, message: 'Failed to load comments', comments: [] };
  }
}

export async function getPostById(postId: string): Promise<{ success: boolean; post?: Post; message?: string }>{
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: 'You must be logged in to view posts' };
    if (user.role !== 'creator' && user.role !== 'craft-business') return { success: false, message: 'Only creators and craft businesses can view community posts' };

    const doc = await firebaseDb.collection('posts').doc(postId).get();
    if (!doc.exists) return { success: false, message: 'Post not found' };
    const data = doc.data() as Record<string, unknown>;
    const createdAt = (data?.createdAt as any)?.toDate ? (data as any).createdAt.toDate().toISOString() : null;
    const updatedAt = (data?.updatedAt as any)?.toDate ? (data as any).updatedAt.toDate().toISOString() : null;

    const [likesCountSnap, commentsCountSnap, userLikeSnap] = await Promise.all([
      firebaseDb.collection('likes').where('postId', '==', doc.id).count().get(),
      firebaseDb.collection('comments').where('postId', '==', doc.id).count().get(),
      firebaseDb.collection('likes').where('postId', '==', doc.id).where('userId', '==', user.id).limit(1).get(),
    ]);

    const post: Post = {
      id: doc.id,
      content: data.content as string,
      imageUrl: (data.imageUrl as string) || null,
      authorId: data.authorId as string,
      authorName: data.authorName as string,
      authorEmail: data.authorEmail as string,
      createdAt,
      updatedAt,
      likesCount: likesCountSnap.data().count || 0,
      commentsCount: commentsCountSnap.data().count || 0,
      liked: !userLikeSnap.empty,
    };

    return { success: true, post };
  } catch (e) {
    console.error('getPostById error', e);
    return { success: false, message: 'Failed to load post' };
  }
}