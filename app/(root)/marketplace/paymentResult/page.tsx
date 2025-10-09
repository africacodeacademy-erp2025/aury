"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Loader, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

interface PaymentResult {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
  channel?: string;
  productName?: string;
  message?: string;
}

const PaymentResultPage = () => {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments-paystack/verify/${reference}`);
        const data = await response.json();
        console.log("Payment verification result:", data);
        
        // Transform API response to match our PaymentResult interface
        if (data.success && data.transaction) {
          setResult({
            success: true,
            reference: data.transaction.reference,
            amount: data.transaction.amount * 100, // Convert back to kobo for display
            currency: data.transaction.currency,
            status: data.transaction.status,
            paidAt: data.transaction.paidAt,
            channel: data.transaction.channel,
            productName: data.transaction.productName,
          });
        } else {
          setResult({
            success: false,
            reference: reference,
            amount: 0,
            currency: 'ZAR',
            status: 'failed',
            message: data.error || 'Failed to verify payment',
          });
        }
      } catch (error) {
        console.error("Failed to verify payment: ", error);
        setResult({
          success: false,
          reference: reference,
          amount: 0,
          currency: 'ZAR',
          status: 'failed',
          message: 'Failed to verify payment',
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Loader className="animate-spin mb-2" />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  if (!reference || !result) {
    return (
      <EmptyState
        imageSrc="/cart-illustartion.webp"
        title="Payment reference not found!"
        description="Unable to verify your payment. Please contact support if you were charged."
        buttonText="Explore Products"
        buttonHref="/marketplace"
      />
    );
  }

  const isSuccess = result.success && result.status === 'success';

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className={`flex items-center justify-center w-20 h-20 rounded-full ${
            isSuccess ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isSuccess ? (
              <BadgeCheck className="w-10 h-10 text-white" strokeWidth={3} />
            ) : (
              <XCircle className="w-10 h-10 text-white" strokeWidth={3} />
            )}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            Payment {isSuccess ? "Successful" : "Failed"}
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            {isSuccess
              ? "Your payment was successful. Thank you for your order!"
              : result.message || "Your payment could not be processed. Please try again."}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Payment Summary
          </h4>
          <div className="border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-200">
              <span className="text-gray-500">Reference</span>
              <span className="text-gray-900 font-mono text-xs truncate max-w-[180px] block">
                {result.reference}
              </span>
            </div>
            {result.productName && (
              <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-200">
                <span className="text-gray-500">Product</span>
                <span className="text-gray-900 font-medium">
                  {result.productName}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-200">
              <span className="text-gray-500">Amount</span>
              <span className="text-gray-900 font-semibold">
                {result.currency} {(result.amount / 100).toFixed(2)}
              </span>
            </div>
            {result.channel && (
              <div className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-200">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-gray-900 font-medium capitalize">
                  {result.channel}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}>
                {result.status}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <Button
            asChild
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-5 rounded-xl cursor-pointer transition"
          >
            <Link href="/marketplace">
              {isSuccess ? "Continue Shopping" : "Try Again"}
            </Link>
          </Button>
          
          {isSuccess && (
            <Button
              asChild
              variant="outline"
              className="w-full font-medium py-5 rounded-xl cursor-pointer"
            >
              <Link href="/orders">View My Orders</Link>
            </Button>
          )}
        </div>

        {/* Powered by Paystack */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Secured by Paystack
        </p>
      </div>
    </div>
  );
};

export default PaymentResultPage;
