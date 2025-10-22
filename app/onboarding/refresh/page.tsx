"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { toast } from "sonner";

/**
 * This page is shown when Stripe onboarding needs to be refreshed.
 * It automatically re-initiates the onboarding process.
 */
function OnboardingRefreshContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sellerId = searchParams.get("sellerId");

  useEffect(() => {
    if (!sellerId) {
      toast.error("Missing seller information");
      router.push("/dashboard");
      return;
    }

    const refreshOnboarding = async () => {
      try {
        const response = await fetch("/api/onboard-seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerId }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("Failed to refresh onboarding");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error refreshing onboarding:", error);
        toast.error("An error occurred. Please try again.");
        router.push("/dashboard");
      }
    };

    refreshOnboarding();
  }, [sellerId, router]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader className="w-12 h-12 animate-spin text-primary-600 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900">
        Refreshing onboarding...
      </h2>
      <p className="text-gray-600 mt-2">Please wait while we redirect you.</p>
    </div>
  );
}

export default function OnboardingRefreshPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
          <Loader className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      }
    >
      <OnboardingRefreshContent />
    </Suspense>
  );
}
