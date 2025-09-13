import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const { userId, authorId } = await req.json();

    if (!userId || !authorId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const userRef = firebaseDb.collection("users").doc(userId);
    const authorRef = firebaseDb.collection("users").doc(authorId);

    await firebaseDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const authorDoc = await transaction.get(authorRef);

      if (!userDoc.exists || !authorDoc.exists) {
        throw new Error("User or Author not found");
      }

      const userData = userDoc.data() || {};
      const authorData = authorDoc.data() || {};

      const userFollowing = new Set(userData.following || []);
      const authorFollowers = new Set(authorData.followers || []);

      if (userFollowing.has(authorId)) {
        userFollowing.delete(authorId);
        authorFollowers.delete(userId);
      } else {
        userFollowing.add(authorId);
        authorFollowers.add(userId);
      }

      transaction.update(userRef, { following: Array.from(userFollowing) });
      transaction.update(authorRef, { followers: Array.from(authorFollowers) });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in updateFollowStatus:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
