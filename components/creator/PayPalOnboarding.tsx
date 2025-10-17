"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeCheck, Loader, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";

interface PayPalOnboardingProps {
  user: User;
  onComplete?: () => void;
}

export default function PayPalOnboarding({ user, onComplete }: PayPalOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentPaypalEmail, setCurrentPaypalEmail] = useState("");

  useEffect(() => {
    // Check if user has already onboarded
    if (user.onboardingComplete && user.paypalEmail) {
      setIsOnboarded(true);
      setCurrentPaypalEmail(user.paypalEmail);
    }
  }, [user.onboardingComplete, user.paypalEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paypalEmail) {
      toast.error("Please enter your PayPal email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/onboard-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: user.id,
          paypalEmail: paypalEmail.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "PayPal email saved successfully!");
        setIsOnboarded(true);
        setCurrentPaypalEmail(paypalEmail);
        onComplete?.();
      } else {
        toast.error(data.error || "Failed to save PayPal email");
      }
    } catch (error) {
      console.error("Error saving PayPal email:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Already onboarded
  if (isOnboarded) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-green-600" />
            <span>PayPal Account Connected</span>
          </CardTitle>
          <CardDescription>
            You&apos;re all set to receive payouts!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">PayPal Email:</span>
                <span className="font-medium">{currentPaypalEmail}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">Ready to receive payouts</span>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Your earnings will be sent to this PayPal account when payouts are processed.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsOnboarded(false);
                setPaypalEmail(currentPaypalEmail);
              }}
            >
              Update PayPal Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not yet onboarded
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Set Up PayPal Payouts
        </CardTitle>
        <CardDescription>
          Enter your PayPal email to receive earnings. It only takes 30 seconds!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">What you&apos;ll need:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ A PayPal account (create one at paypal.com)</li>
              <li>✓ Your PayPal email address</li>
              <li>✓ Less than 1 minute to complete</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypalEmail">PayPal Email Address</Label>
            <Input
              id="paypalEmail"
              type="email"
              placeholder="your-email@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              required
              className="bg-white"
            />
            <p className="text-xs text-gray-500">
              Make sure this matches your PayPal account email exactly.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save PayPal Email"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your PayPal email is secure and will only be used for sending payouts.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
