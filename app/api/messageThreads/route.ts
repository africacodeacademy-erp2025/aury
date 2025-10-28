import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";

interface MessageThread {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastUpdated?: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Query threads where the current user is a participant
    const snapshot = await firebaseDb
      .collection("messageThreads")
      .where("participants", "array-contains", userId)
      .get();

    const threads: MessageThread[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: Array.isArray(data.participants)
          ? data.participants
          : [],
        lastMessage:
          typeof data.lastMessage === "string" ? data.lastMessage : undefined,
        lastUpdated:
          data.lastUpdated?.toDate?.() ?? undefined,
      };
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}
