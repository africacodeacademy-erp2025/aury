// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin"; // Admin SDK

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  timestamp: string; // ISO string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ messages: [] });
    }

    const snapshot = await firebaseDb
      .collection("messages")
      .where("threadId", "==", threadId)
      .orderBy("timestamp", "asc")
      .get();

    const messages: Message[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        threadId: data.threadId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        read: data.read,
        timestamp: data.timestamp?.toDate().toISOString() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { threadId, senderId, receiverId, content } = body;

    if (!threadId || !senderId || !receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMessageRef = firebaseDb.collection("messages").doc();
    const newMessage = {
      threadId,
      senderId,
      receiverId,
      content,
      read: false,
      timestamp: new Date(),
    };

    await newMessageRef.set(newMessage);

    // Update lastMessage and lastTimestamp in thread
    await firebaseDb.collection("messageThreads").doc(threadId).update({
      lastMessage: content,
      lastTimestamp: new Date(),
    });

    return NextResponse.json({
      id: newMessageRef.id,
      ...newMessage,
      timestamp: newMessage.timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
