"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

interface StartConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    recipientName: string;
    productId?: string;
    productName?: string;
}

export function StartConversationModal({
    isOpen,
    onClose,
    recipientId,
    recipientName,
    productId,
    productName,
}: StartConversationModalProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const handleSend = async () => {
        if (!message.trim()) {
            setError("Please enter a message");
            return;
        }

        setSending(true);
        setError("");

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientId,
                    content: message,
                    productId,
                    productName,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("");
                onClose();
                // Redirect to messages page
                window.location.href = `/messages?conversation=${data.conversationId}`;
            } else {
                setError(data.message || "Failed to send message");
            }
        } catch {
            setError("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-card dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                        Message {recipientName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {productName && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">About:</p>
                        <p className="font-medium text-foreground">{productName}</p>
                    </div>
                )}

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 min-h-[120px] text-foreground placeholder:text-muted-foreground"
                    disabled={sending}
                />

                {error && (
                    <p className="text-destructive-100 text-sm mt-2">{error}</p>
                )}

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground"
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="flex-1 px-4 py-2 bg-primary-200 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                        {sending ? "Sending..." : "Send"}
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
