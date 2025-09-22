// types/index.d.ts
// Global type declarations for the project
// ✅ Converted to a module for proper imports

// -------------------
// User & Auth
// -------------------
export interface User {
  name: string;
  email: string;
  id: string;
  role: "creator" | "customer" | "craft-business";
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: "creator" | "customer" | "craft-business";
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export type FormType = "sign-up" | "sign-in";

// -------------------
// Post Types
// -------------------
export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: string | null;
  updatedAt: string | null;
  likesCount?: number;
  commentsCount?: number;
  liked?: boolean;
}

export interface CreatePostParams {
  content: string;
  imageUrl?: string | null;
}

export interface CreatePostResult {
  success: boolean;
  message?: string;
  postId?: string;
}

export interface GetPostsResult {
  success: boolean;
  message?: string;
  posts?: Post[];
}

export interface UploadImageResult {
  success: boolean;
  message?: string;
  url?: string;
  imageId?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface GetCommentsResult {
  success: boolean;
  message?: string;
  comments?: PostComment[];
}

export interface ToggleLikeResult {
  success: boolean;
  message?: string;
  liked?: boolean;
  likesCount?: number;
}

export interface AddCommentResult {
  success: boolean;
  message?: string;
  comment?: PostComment;
}

// -------------------
// Product Types
// -------------------
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  imageUrl?: string | null;
  stock?: number;
  materials?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  sellerId: string;
  sellerName: string;
  sellerType: "creator" | "craft-business";
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl?: string | null;
  stock?: number;
  materials?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
}

export interface GetProductsResult {
  success: boolean;
  message?: string;
  products?: Product[];
}

// -------------------
// Follower Type
// -------------------
export interface Follower {
  id: string;
  username: string;
  photoURL?: string;
}

// -------------------
// Order Types
// -------------------
export interface Order {
  id: string;
  creatorId: string;
  customerId: string;
  customerName: string;
  products: OrderProduct[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";
  createdAt: {
    toDate: () => Date;
  } | null;
}

export interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

// Make this a module
export {};
