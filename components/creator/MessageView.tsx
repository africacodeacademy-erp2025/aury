// components/MessageView.tsx
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

interface MessageViewProps {
  threadId: string;
  otherUserId: string;
  onClose: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({ threadId, otherUserId, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || !threadId) return;

    const messagesRef = collection(db, "messages");
    const messagesQuery = query(
      messagesRef,
      where("threadId", "==", threadId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
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
      scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [threadId, currentUser]);

  const handleSend = async (e: React.FormEvent) => {
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-sm">
            ✕ Close
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto border p-3 rounded-lg space-y-2 mb-3 bg-gray-50"
          ref={scrollRef}
        >
          {messages.length === 0 && <p className="text-gray-500 text-center">No messages yet.</p>}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}
            >
              <div className={`p-2 rounded-lg max-w-xs ${msg.senderId === currentUser?.uid ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                <p>{msg.content}</p>
                <span className="block text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageView;
