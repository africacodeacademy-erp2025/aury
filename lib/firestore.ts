// lib/firestore.ts
import { db } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";

export interface UserProfile {
  id?: string;
  displayName?: string;
  fullName?: string;
  photoURL?: string;
  bio?: string;
}

export interface Follower { username?: string }
export interface Post { caption?: string; imageUrl?: string }
export interface Item { name?: string; price?: number; imageUrl?: string }

// ✅ Auto-create user if not exists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createUserIfNotExists(userId: string, authUser: any): Promise<UserProfile> {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const newUser: UserProfile = {
      displayName: authUser.displayName || "No Name",
      fullName: authUser.displayName || "No Name",
      photoURL: authUser.photoURL || "/default-avatar.png",
      bio: "Hello! I am new here.",
    };
    await setDoc(userRef, { ...newUser, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return newUser;
  }

  return { id: userDoc.id, ...userDoc.data() } as UserProfile;
}

export async function getFollowers(userId: string): Promise<Follower[]> {
  const snap = await getDocs(collection(db, "users", userId, "followers"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Follower));
}

export async function getPosts(userId: string): Promise<Post[]> {
  const snap = await getDocs(collection(db, "users", userId, "posts"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

export async function getItems(userId: string): Promise<Item[]> {
  const snap = await getDocs(collection(db, "users", userId, "items"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
}
