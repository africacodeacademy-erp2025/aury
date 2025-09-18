// types/post.ts

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: Date; // properly typed
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  imageUrl?: string;
  createdAt: Date; // properly typed
  likesCount?: number;
  liked?: boolean; // whether the current user liked this post
  commentsCount?: number;
}
