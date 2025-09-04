interface User {
  name: string;
  email: string;
  id: string;
  role: "creator" | "customer" | "craft-business";
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: "creator" | "customer" | "craft-business";
}
interface SignInParams {
  email: string;
  idToken: string;
}

type FormType = "sign-up" | "sign-in";

interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: string | null; // ISO string serialized from Firestore Timestamp
  updatedAt: string | null; // ISO string serialized from Firestore Timestamp
  likesCount?: number;
  commentsCount?: number;
  liked?: boolean;
}

interface CreatePostParams {
  content: string;
  imageUrl?: string | null;
}

interface CreatePostResult {
  success: boolean;
  message?: string;
  postId?: string;
}

interface GetPostsResult {
  success: boolean;
  message?: string;
  posts?: Post[];
}

interface UploadImageResult {
  success: boolean;
  message?: string;
  url?: string;
  imageId?: string;
}

interface PostComment {
  id: string;
  postId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string; // ISO string
}

interface GetCommentsResult {
  success: boolean;
  message?: string;
  comments?: PostComment[];
}

interface ToggleLikeResult {
  success: boolean;
  message?: string;
  liked?: boolean;
  likesCount?: number;
}

interface AddCommentResult {
  success: boolean;
  message?: string;
  comment?: PostComment;
}

// Product Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  imageUrl?: string | null;
  stock?: number;
  materials?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  sellerId: string;
  sellerName: string;
  sellerType: 'creator' | 'craft-business';
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  createdAt: string | null;
  updatedAt: string | null;
}

interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl?: string | null;
  stock?: number;
  materials?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

interface GetProductsResult {
  success: boolean;
  message?: string;
  products?: Product[];
}