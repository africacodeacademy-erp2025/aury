"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { Conversation, Message } from "@/types/message";
import { useAuth } from "./useAuth";

export function useConversations() {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }

        const conversationsQuery = query(
            collection(db, "conversations"),
            where("participantIds", "array-contains", currentUser.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(
            conversationsQuery,
            (snapshot) => {
                const conversationsData = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    } as Conversation;
                });

                setConversations(conversationsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching conversations:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser?.uid]);

    return { conversations, loading, error };
}

export function useMessages(conversationId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!conversationId) {
            setLoading(false);
            return;
        }

        const messagesQuery = query(
            collection(db, "messages"),
            where("conversationId", "==", conversationId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const messagesData = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                    } as Message;
                });

                setMessages(messagesData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching messages:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [conversationId]);

    return { messages, loading, error };
}

export function useUnreadCount() {
    const { currentUser } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser?.uid) {
            setUnreadCount(0);
            return;
        }

        const conversationsQuery = query(
            collection(db, "conversations"),
            where("participantIds", "array-contains", currentUser.uid)
        );

        const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
            let total = 0;
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const userUnread = data.unreadCount?.[currentUser.uid] || 0;
                total += userUnread;
            });
            setUnreadCount(total);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);

    return unreadCount;
}
