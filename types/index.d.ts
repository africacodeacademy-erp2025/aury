interface User {
  name: string;
  email: string;
  id: string;
  role: "creator" | "customer";
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: "creator" | "customer";
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