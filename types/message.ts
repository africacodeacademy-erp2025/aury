export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    createdAt: Date;
    read: boolean;
    type: 'text' | 'product_inquiry';
    productId?: string; // If it's a product inquiry
    productName?: string;
}

export interface Conversation {
    id: string;
    participants: Participant[];
    participantIds: string[]; // For easier querying
    lastMessage: string;
    lastMessageAt: Date;
    lastSenderId: string;
    unreadCount: {
        [userId: string]: number;
    };
    productId?: string; // If conversation started from a product
    productName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Participant {
    id: string;
    name: string;
    avatar?: string;
    role: 'creator' | 'customer';
}

export interface ConversationWithMessages extends Conversation {
    messages: Message[];
}

export interface CreateConversationData {
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    recipientRole: 'creator' | 'customer';
    productId?: string;
    productName?: string;
    initialMessage: string;
}

export interface SendMessageData {
    conversationId: string;
    content: string;
    productId?: string;
    productName?: string;
}
