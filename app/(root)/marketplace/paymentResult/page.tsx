"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Loader } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

const PaymentResultPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const fetchCheckoutSession = async () => {
      try {
        const response = await fetch(`/api/payments/${sessionId}`);
        const data = await response.json();
        console.log("Session data:", data);
        setSession(data);


        // If payment was successful and it's a pattern product, deliver the pattern
        if (data.payment_status === "paid" && data.metadata?.productId) {
          try {
            console.log("Delivering pattern for product:", data.metadata.productId);
            const deliveryResponse = await fetch('/api/patterns/deliver', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: data.metadata.productId,
                customerEmail: data.customer_details?.email || data.metadata?.customerEmail,
                customerName: data.customer_details?.name || data.metadata?.customerName,
              }),
            });
            
            const deliveryResult = await deliveryResponse.json();
            if (deliveryResult.success) {
              console.log("Pattern delivered successfully!");
            } else {
              console.warn("Pattern delivery failed:", deliveryResult.message);
            }
          } catch (error) {
            console.error("Pattern delivery error:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load payment result: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Loader className="animate-spin mb-2" />
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        imageSrc="/cart-illustartion.webp"
        title="Payment session not found!"
        description=""
        buttonText="Explore Products"
        buttonHref="/marketplace"
      />
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full">
            <BadgeCheck className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            Payment{" "}
            {session.payment_status === "paid" ? "Successful" : "Failed"}
          </h3>
          <p className="text-gray-500 text-sm">
            {session.payment_status === "paid"
              ? "Your payment was successful, Thank you for your order."
              : "Your payment could not be processed."}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Payment Summary
          </h4>
          <div className="border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="text-gray-900 font-medium truncate max-w-[180px] block">{session.id}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-gray-500">Total</span>
              <span className="text-gray-900 font-semibold">
                {(session.amount_total / 100).toFixed(2)}{" "}
                {session.currency}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-medium ${
                  session.payment_status === "paid"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {session.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-6">
          <Button
            asChild
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-5 rounded-xl cursor-pointer transition"
          >
            <Link href="/marketplace">Explore Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
