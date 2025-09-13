import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const authorId = searchParams.get("authorId");

    if (!userId || !authorId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const userRef = firebaseDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ isFollowing: false });
    }

    const userData = userSnap.data();
    const isFollowing = userData?.following?.includes(authorId);

    return NextResponse.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error("Error in checkFollowing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
