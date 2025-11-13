"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Conversation } from "@/types/message";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MessageCircle } from "lucide-react";
import { useConversations } from "@/lib/useMessaging";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversation");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showMobileThread, setShowMobileThread] = useState(false);
  const { conversations } = useConversations();

  // Auto-select conversation from URL parameter
  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const conversation = conversations.find(
        (c) => c.id === conversationIdFromUrl
      );
      if (conversation) {
        setSelectedConversation(conversation);
        setShowMobileThread(true);
      }
    }
  }, [conversationIdFromUrl, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileThread(true);
  };

  const handleBack = () => {
    setShowMobileThread(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-card dark:bg-card rounded-xl shadow-lg border border-border overflow-hidden h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Conversation List */}
            <div
              className={`lg:col-span-1 border-r border-border overflow-y-auto ${
                showMobileThread ? "hidden lg:block" : ""
              }`}
            >
              <div className="p-4 border-b border-border bg-muted/30">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <MessageCircle className="w-6 h-6 text-primary-200" />
                  Messages
                </h1>
              </div>
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            </div>

            {/* Message Thread */}
            <div
              className={`lg:col-span-2 ${
                showMobileThread ? "" : "hidden lg:block"
              }`}
            >
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  onBack={handleBack}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
