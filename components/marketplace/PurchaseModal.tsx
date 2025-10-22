"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/firebase/client";
import { Loader, ExternalLink, Shield, CreditCard } from "lucide-react";

const PurchaseModal = ({ productId }: { productId: string }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const handlePurchase = async () => {
    if (!userId) {
      toast.error("Please sign in to make a purchase");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payments-paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          productId,
          buyerId: userId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data?.error) {
        toast.error(data.error || "Failed to initialize payment");
        return;
      }

      // Redirect to Paystack checkout page
      if (data.authorizationUrl) {
        toast.success("Redirecting to payment page...");
        window.location.href = data.authorizationUrl;
      } else {
        toast.error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Error creating payment: ", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-600 cursor-pointer hover:bg-primary-700">
          Purchase
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src="/aury-logo.png"
              alt="Aury Logo"
              width={35}
              height={35}
              className="shrink-0"
            />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent font-semibold text-lg lg:text-xl">
              Secure Checkout
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* CONTENT */}
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Secure Payment with Paystack
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                Multiple payment methods accepted
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Bank-level security & encryption
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-green-600" />
                Redirects to Paystack secure page
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              You&apos;ll be redirected to Paystack&apos;s secure payment page to complete your purchase.
              After payment, you&apos;ll be returned to Aury to view your order.
            </p>
          </div>

          {!userId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Please sign in to continue with your purchase
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button 
              variant="outline" 
              className="flex-1 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handlePurchase}
            disabled={loading || !userId}
            className="flex-1 bg-primary-600 hover:bg-primary-700 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
