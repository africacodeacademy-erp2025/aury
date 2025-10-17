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
  
  // Legacy Stripe fields (deprecated)
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  
  // PayPal payout fields
  paypalEmail?: string;
  payoutMethod?: "paypal" | "bank" | "stripe";
  onboardingComplete?: boolean;
  onboardedAt?: string;
  lastPayoutAt?: string;
  lastPayoutAmount?: number;
  pendingEarnings?: number;
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
  imageId?: string; // Optional since not all uploads create Firestore documents
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
  payoutProcessed?: boolean; // Track if seller has been paid
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

// -------------------
// Payout Types
// -------------------
export interface Payout {
  id: string;
  sellerId: string;
  paypalEmail: string;
  amount: number;
  payoutFee: number;
  netAmount: number;
  currency: string;
  status: string;
  batchId: string;
  createdAt: string;
  method: "paypal";
  triggeredBy?: "admin" | "automatic" | "manual";
}

// -------------------
// Pattern Types
// -------------------
export interface PatternData {
  patternName: string;
  projectType: string;
  difficultyLevel: string;
  yarnWeight: string;
  hookSize: string;
  sizeDimensions: string;
  customInstructions?: string;
  generatedPattern: string;
}

export interface PatternProduct extends Product {
  productType: 'pattern';
  patternContent: string;
  patternData: PatternData;
}

export interface PatternProductParams extends CreateProductParams {
  patternContent: string;
  patternData: PatternData;
  productType: 'pattern';
}

// -------------------
// Email & PDF Types
// -------------------
export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface PatternPDFData {
  patternName: string;
  customerName: string;
  customerEmail: string;
  purchaseDate: string;
  patternContent: string;
  productImage?: string;
  patternData: PatternData;
}

// Make this a module
export {};
