import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Admin once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { userId, authorId, isFollowing } = await req.json();

    if (!userId || !authorId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const followRef = db
      .collection("followers")
      .doc(userId)
      .collection("following")
      .doc(authorId);

    if (isFollowing) {
      // Unfollow
      await followRef.delete();
    } else {
      // Follow
      await followRef.set({
        followedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating follow status:", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}
