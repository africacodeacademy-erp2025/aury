"use client";

import { useState, useEffect, useRef } from "react";
import { Message, Conversation } from "@/types/message";
import Loader from "@/components/Loader";
import { useAuth } from "@/lib/useAuth";
import { useMessages } from "@/lib/useMessaging";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";

interface MessageThreadProps {
    conversation: Conversation;
    onBack?: () => void;
}

export function MessageThread({ conversation, onBack }: MessageThreadProps) {
    const { currentUser: user } = useAuth();
    const { messages, loading } = useMessages(conversation.id);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const otherParticipant = conversation.participants.find(
        (p) => p.id !== user?.uid
    );

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        markAsRead();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const markAsRead = async () => {
        try {
            await fetch("/api/messages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId: conversation.id }),
            });
        } catch (error) {
            console.error("Failed to mark messages as read:", error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: conversation.id,
                    content: newMessage,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setNewMessage("");
                // Real-time listener will automatically update messages
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b border-border p-4 flex items-center gap-3 bg-muted/30">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Back to conversations"
                    >
                        ←
                    </button>
                )}
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{otherParticipant?.name}</h3>
                    {conversation.productName && (
                        <p className="text-sm text-muted-foreground">
                            About: {conversation.productName}
                        </p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.senderId === user?.uid}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={sendMessage}
                className="border-t border-border p-4 flex items-center gap-2 bg-muted/30"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-input bg-background rounded-full focus:outline-none focus:ring-2 focus:ring-primary-200 text-foreground placeholder:text-muted-foreground"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-5 py-3 bg-primary-200 text-white rounded-full hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}>
            <div
                className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                    isOwn
                        ? "bg-primary-200 text-white"
                        : "bg-muted border border-border text-foreground"
                }`}
            >
                {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                        {message.senderName}
                    </p>
                )}
                <p className="wrap-break-word leading-relaxed">{message.content}</p>
                <p
                    className={`text-xs mt-1 ${
                        isOwn ? "text-white/70" : "text-muted-foreground"
                    }`}
                >
                    {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
