import { getCurrentUser } from "@/lib/actions/auth.action";
import { firebaseDb } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (conversationId) {
            // Get messages for a specific conversation
            const messagesSnapshot = await firebaseDb
                .collection("messages")
                .where("conversationId", "==", conversationId)
                .orderBy("createdAt", "asc")
                .get();

            const messages = messagesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));

            return NextResponse.json(
                { success: true, messages },
                { status: 200 }
            );
        } else {
            // Get all conversations for the user
            const conversationsSnapshot = await firebaseDb
                .collection("conversations")
                .where("participantIds", "array-contains", user.id)
                .orderBy("lastMessageAt", "desc")
                .get();

            const conversations = conversationsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                lastMessageAt: doc.data().lastMessageAt?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            }));

            return NextResponse.json(
                { success: true, conversations },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch messages.",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { conversationId, recipientId, content, productId, productName } = body;

        if (!content?.trim()) {
            return NextResponse.json(
                { success: false, message: "Message content is required." },
                { status: 400 }
            );
        }

        let finalConversationId = conversationId;

        // If no conversationId, create a new conversation
        if (!conversationId && recipientId) {
            // Check if conversation already exists between these users
            const existingConversations = await firebaseDb
                .collection("conversations")
                .where("participantIds", "array-contains", user.id)
                .get();

            let existingConversation = null;
            for (const doc of existingConversations.docs) {
                const data = doc.data();
                if (
                    data.participantIds.includes(recipientId) &&
                    data.participantIds.length === 2
                ) {
                    existingConversation = { id: doc.id, ...data };
                    break;
                }
            }

            if (existingConversation) {
                finalConversationId = existingConversation.id;
            } else {
                // Get recipient details
                const recipientDoc = await firebaseDb.collection("users").doc(recipientId).get();
                const recipientData = recipientDoc.data();

                if (!recipientData) {
                    return NextResponse.json(
                        { success: false, message: "Recipient not found." },
                        { status: 404 }
                    );
                }

                // Create new conversation
                const conversationRef = firebaseDb.collection("conversations").doc();
                const conversationData = {
                    participants: [
                        {
                            id: user.id,
                            name: user.name || user.email || "User",
                            avatar: "",
                            role: user.role || "customer",
                        },
                        {
                            id: recipientId,
                            name: recipientData.name || recipientData.email || "User",
                            avatar: recipientData.photoURL || "",
                            role: recipientData.role || "creator",
                        },
                    ],
                    participantIds: [user.id, recipientId],
                    lastMessage: content,
                    lastMessageAt: new Date(),
                    lastSenderId: user.id,
                    unreadCount: {
                        [user.id]: 0,
                        [recipientId]: 1,
                    },
                    productId: productId || null,
                    productName: productName || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await conversationRef.set(conversationData);
                finalConversationId = conversationRef.id;
            }
        }

        if (!finalConversationId) {
            return NextResponse.json(
                { success: false, message: "Invalid conversation." },
                { status: 400 }
            );
        }

        // Create the message
        const messageRef = firebaseDb.collection("messages").doc();
        const messageData = {
            conversationId: finalConversationId,
            senderId: user.id,
            senderName: user.name || user.email || "User",
            senderAvatar: "",
            content: content.trim(),
            createdAt: new Date(),
            read: false,
            type: productId ? "product_inquiry" : "text",
            productId: productId || null,
            productName: productName || null,
        };

        await messageRef.set(messageData);

        // Update conversation with last message
        const conversationRef = firebaseDb.collection("conversations").doc(finalConversationId);
        const conversationDoc = await conversationRef.get();
        const conversationData = conversationDoc.data();

        if (conversationData) {
            const otherParticipantId = conversationData.participantIds.find(
                (id: string) => id !== user.id
            );

            await conversationRef.update({
                lastMessage: content.trim(),
                lastMessageAt: new Date(),
                lastSenderId: user.id,
                updatedAt: new Date(),
                [`unreadCount.${otherParticipantId}`]: (conversationData.unreadCount?.[otherParticipantId] || 0) + 1,
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Message sent successfully.",
                conversationId: finalConversationId,
                messageId: messageRef.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Failed to send message.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated." },
                { status: 401 }
            );
        }

        const { conversationId } = await request.json();

        if (!conversationId) {
            return NextResponse.json(
                { success: false, message: "Conversation ID is required." },
                { status: 400 }
            );
        }

        // Mark all messages in the conversation as read
        const messagesSnapshot = await firebaseDb
            .collection("messages")
            .where("conversationId", "==", conversationId)
            .where("senderId", "!=", user.id)
            .where("read", "==", false)
            .get();

        const batch = firebaseDb.batch();
        messagesSnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { read: true });
        });

        // Reset unread count for this user in the conversation
        const conversationRef = firebaseDb.collection("conversations").doc(conversationId);
        batch.update(conversationRef, {
            [`unreadCount.${user.id}`]: 0,
        });

        await batch.commit();

        return NextResponse.json(
            { success: true, message: "Messages marked as read." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Mark as read error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Failed to mark messages as read.",
            },
            { status: 500 }
        );
    }
}
