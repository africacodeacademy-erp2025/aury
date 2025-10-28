"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

export interface Thread {
  id: string;
  customerId: string;
  creatorId: string;
  productId: string;
  orderId?: string;
  lastMessage: string;
  lastTimestamp: string; // ISO string
  participants: string[];
}

interface InboxProps {
  onSelectThread: (threadId: string, otherUserId: string) => void;
  isCreator?: boolean;
}

const Inbox: React.FC<InboxProps> = ({ onSelectThread, isCreator = false }) => {
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchThreads = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/messageThreads?userId=${currentUser.uid}`);
        if (!res.ok) throw new Error("Failed to fetch threads");

        const data: { threads: Thread[] } = await res.json();
        setThreads(data.threads);
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError("Could not load threads. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [currentUser]);

  const renderContent = () => {
    if (loading) return <p className="text-gray-500">Loading threads...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!threads.length) return <p className="text-gray-500">No messages yet.</p>;

    return (
      <ul>
        {threads.map((thread) => {
          const otherUserId = isCreator ? thread.customerId : thread.creatorId;
          return (
            <li
              key={thread.id}
              className="border-b border-gray-200 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectThread(thread.id, otherUserId)}
            >
              <p className="font-semibold">{thread.lastMessage}</p>
              <small className="text-gray-500">
                Product: {thread.productId} | Order: {thread.orderId || "N/A"}
              </small>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Inbox</h2>
      {renderContent()}
    </div>
  );
};

export default Inbox;
