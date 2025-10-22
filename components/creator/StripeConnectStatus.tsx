"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Loader, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";

interface StripeConnectStatusProps {
  user: User;
}

export default function StripeConnectStatus({ user }: StripeConnectStatusProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{
    onboardingComplete: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    // If user has a Stripe account, verify its status
    if (user.stripeAccountId) {
      verifyAccountStatus();
    }
  }, [user.stripeAccountId]);

  const verifyAccountStatus = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/onboard-seller/verify?sellerId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setAccountStatus({
          onboardingComplete: data.onboardingComplete,
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
        });
      }
    } catch (error) {
      console.error("Error verifying account status:", error);
    } finally {
      setVerifying(false);
    }
  };

  const handleOnboard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/onboard-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: user.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start onboarding");
      }
    } catch (error) {
      console.error("Error starting onboarding:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Not yet onboarded
  if (!user.stripeAccountId || !user.stripeOnboardingComplete) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Set Up Payments
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to start receiving payments from your sales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">What you&apos;ll need:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Government-issued ID</li>
                <li>✓ Bank account details</li>
                <li>✓ Business information (if applicable)</li>
                <li>✓ 5-10 minutes to complete</li>
              </ul>
            </div>
            
            <Button
              onClick={handleOnboard}
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Start Onboarding"
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Powered by Stripe Connect. Your information is secure.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Onboarding complete
  if (verifying) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFullyEnabled = accountStatus?.chargesEnabled && accountStatus?.payoutsEnabled;

  return (
    <Card className={isFullyEnabled ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isFullyEnabled ? (
            <>
              <BadgeCheck className="w-5 h-5 text-green-600" />
              <span>Payment Account Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span>Action Required</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isFullyEnabled
            ? "Your Stripe account is fully set up and ready to receive payments."
            : "Additional information needed to complete your account setup."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Onboarding Complete</span>
              {accountStatus?.onboardingComplete ? (
                <BadgeCheck className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Charges Enabled</span>
              {accountStatus?.chargesEnabled ? (
                <BadgeCheck className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Payouts Enabled</span>
              {accountStatus?.payoutsEnabled ? (
                <BadgeCheck className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
          </div>

          {!isFullyEnabled && (
            <Button
              onClick={handleOnboard}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
