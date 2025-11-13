"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { StartConversationModal } from "@/components/messaging/StartConversationModal";
import { Button } from "@/components/ui/button";

interface ContactSellerButtonProps {
    sellerId: string;
    sellerName: string;
    productId?: string;
    productName?: string;
}

export function ContactSellerButton({
    sellerId,
    sellerName,
    productId,
    productName,
}: ContactSellerButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
            >
                <MessageCircle className="w-4 h-4" />
                Contact Seller
            </Button>

            <StartConversationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                recipientId={sellerId}
                recipientName={sellerName}
                productId={productId}
                productName={productName}
            />
        </>
    );
}
