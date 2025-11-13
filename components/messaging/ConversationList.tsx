"use client";

import { useConversations } from "@/lib/useMessaging";
import { Conversation } from "@/types/message";
import { useAuth } from "@/lib/useAuth";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/components/Loader";
import { MessageCircle } from "lucide-react";

interface ConversationListProps {
    onSelectConversation: (conversation: Conversation) => void;
    selectedConversationId?: string;
}

export function ConversationList({
    onSelectConversation,
    selectedConversationId,
}: ConversationListProps) {
    const { currentUser: user } = useAuth();
    const { conversations, loading } = useConversations();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-4">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-sm text-center">
                    Start a conversation from the marketplace
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border">
            {conversations.map((conversation) => {
                const otherParticipant = conversation.participants.find(
                    (p) => p.id !== user?.uid
                );
                const unreadCount =
                    conversation.unreadCount?.[user?.uid || ""] || 0;
                const isSelected = conversation.id === selectedConversationId;

                return (
                    <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-primary-200/10 border-l-4 border-primary-200" : ""
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-white font-semibold shrink-0">
                                {otherParticipant?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold truncate text-foreground">
                                        {otherParticipant?.name}
                                    </h3>
                                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                        {formatDistanceToNow(
                                            conversation.lastMessageAt,
                                            { addSuffix: true }
                                        )}
                                    </span>
                                </div>
                                {conversation.productName && (
                                    <p className="text-xs text-primary-200 mb-1 truncate">
                                        📦 {conversation.productName}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground truncate">
                                    {conversation.lastSenderId === user?.uid
                                        ? "You: "
                                        : ""}
                                    {conversation.lastMessage}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <div className="w-6 h-6 rounded-full bg-destructive-100 text-white text-xs flex items-center justify-center shrink-0 font-bold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
