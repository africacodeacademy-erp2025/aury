"use client";

import React, { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface MessageThreadProps {
  threadId: string;
  otherUserId: string;
  onBack: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  threadId,
  otherUserId,
  onBack,
}) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // -------------------------
  // Real-time messages
  // -------------------------
  useEffect(() => {
    if (!threadId || !currentUser) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("threadId", "==", threadId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        threadId: doc.data().threadId,
        senderId: doc.data().senderId,
        receiverId: doc.data().receiverId,
        content: doc.data().content,
        read: doc.data().read,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(fetched);

      // Scroll to bottom
      scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [threadId, currentUser]);

  // -------------------------
  // Send message
  // -------------------------
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        threadId,
        senderId: currentUser.uid,
        receiverId: otherUserId,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-md">
      <button onClick={onBack} className="mb-4 text-blue-500">
        &larr; Back
      </button>

      <div
        ref={scrollRef}
        className="mb-4 h-80 overflow-y-auto border rounded p-2 flex flex-col gap-2"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded max-w-xs ${
                msg.senderId === currentUser?.uid
                  ? "self-end bg-blue-600 text-white"
                  : "self-start bg-gray-200"
              }`}
            >
              <p>{msg.content}</p>
              <small className="text-xs opacity-70 mt-1 block">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageThread;
