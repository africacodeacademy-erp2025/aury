"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BadgeCheck, Loader, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * This page is shown after a seller completes Stripe onboarding.
 * It verifies the account status and updates the database.
 */
export default function OnboardingCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sellerId = searchParams.get("sellerId");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    if (!sellerId) {
      setStatus("error");
      setMessage("Missing seller information");
      return;
    }

    const verifyOnboarding = async () => {
      try {
        // Check onboarding status
        const response = await fetch(`/api/onboard-seller/verify?sellerId=${sellerId}`);
        const data = await response.json();

        if (data.success && data.onboardingComplete) {
          setStatus("success");
          setMessage("Your account has been successfully set up!");
          toast.success("Stripe account connected successfully!");
        } else {
          setStatus("error");
          setMessage("Onboarding is incomplete. Please try again.");
          toast.error("Please complete all required information.");
        }
      } catch (error) {
        console.error("Error verifying onboarding:", error);
        setStatus("error");
        setMessage("Failed to verify account. Please contact support.");
        toast.error("Verification failed");
      }
    };

    verifyOnboarding();
  }, [sellerId]);

  const handleContinue = () => {
    if (status === "success") {
      router.push("/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="flex flex-col items-center text-center">
          {status === "loading" && (
            <>
              <Loader className="w-16 h-16 animate-spin text-primary-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Verifying Account
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <BadgeCheck className="w-12 h-12 text-green-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                All Set! 🎉
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="w-full space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-blue-900 mb-1">What's next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Create and list your products</li>
                    <li>✓ Start receiving payments</li>
                    <li>✓ Track your earnings in real-time</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
            </>
          )}
        </div>

        <Button
          onClick={handleContinue}
          className="w-full mt-6 bg-primary-600 hover:bg-primary-700 cursor-pointer"
          disabled={status === "loading"}
        >
          {status === "success" ? "Go to Dashboard" : "Return to Dashboard"}
        </Button>
      </div>
    </div>
  );
}
