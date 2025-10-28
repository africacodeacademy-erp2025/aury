// components/MessageModal.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

interface MessageModalProps {
  creatorId: string;
  productId: string;
  orderId?: string;
  productName: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ creatorId, productId, orderId, productName, onClose }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !message.trim()) return;

    setSending(true);
    try {
      // 1️⃣ Check if thread exists
      const threadQuery = query(
        collection(db, "messageThreads"),
        where("customerId", "==", currentUser.uid),
        where("creatorId", "==", creatorId),
        where("productId", "==", productId)
      );

      const snapshot = await getDocs(threadQuery);
      let threadId: string;

      if (!snapshot.empty) {
        const existingThread = snapshot.docs[0];
        threadId = existingThread.id;

        await updateDoc(doc(db, "messageThreads", threadId), {
          lastMessage: message,
          lastTimestamp: serverTimestamp(),
        });
      } else {
        const newThreadRef = await addDoc(collection(db, "messageThreads"), {
          customerId: currentUser.uid,
          creatorId,
          productId,
          orderId: orderId || null,
          lastMessage: message,
          lastTimestamp: serverTimestamp(),
          participants: [currentUser.uid, creatorId],
        });
        threadId = newThreadRef.id;
      }

      // 2️⃣ Add message
      await addDoc(collection(db, "messages"), {
        threadId,
        senderId: currentUser.uid,
        receiverId: creatorId,
        content: message,
        timestamp: serverTimestamp(),
        read: false,
      });

      setMessage("");
      onClose();
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Message Creator about {productName}</h2>
        <form onSubmit={handleSend}>
          <textarea
            className="w-full h-32 border border-gray-300 rounded p-2 mb-3"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
