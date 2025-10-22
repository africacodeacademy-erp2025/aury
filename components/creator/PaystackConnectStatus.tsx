"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Loader, Wallet, Building2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaystackConnectStatusProps {
  user: User;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  country: string;
  currency: string;
}

export default function PaystackConnectStatus({ user }: PaystackConnectStatusProps) {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  
  // Form state
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [businessName, setBusinessName] = useState(user.name || "");

  useEffect(() => {
    if (showOnboardingForm) {
      fetchBanks();
    }
  }, [showOnboardingForm]);

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/banks');
      const data = await response.json();
      
      if (data.success) {
        setBanks(data.banks);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error("Failed to load banks");
    }
  };

  const validateAccountNumber = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length !== 10) {
      toast.error("Please select a bank and enter a valid 10-digit account number");
      return;
    }

    setValidating(true);
    try {
      const response = await fetch('/api/onboard-seller-paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id,
          bankCode: selectedBank,
          accountNumber,
          validateOnly: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.accountName) {
        setAccountName(data.accountName);
        toast.success(`Account validated: ${data.accountName}`);
      } else {
        toast.error(data.error || "Failed to validate account");
      }
    } catch (error) {
      console.error("Error validating account:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBank || !accountNumber || !businessName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!accountName) {
      toast.error("Please validate your account number first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/onboard-seller-paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: user.id,
          bankCode: selectedBank,
          accountNumber,
          businessName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment account connected successfully! 🎉");
        setShowOnboardingForm(false);
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to create payment account");
      }
    } catch (error) {
      console.error("Error creating payment account:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Not yet onboarded
  if (!user.paystackSubaccountCode || !user.paystackOnboardingComplete) {
    return (
      <>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Set Up Payments
            </CardTitle>
            <CardDescription>
              Connect your bank account to start receiving payments from your sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">What you&apos;ll need:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Bank account number</li>
                  <li>✓ Bank name</li>
                  <li>✓ Business/Account name</li>
                  <li>✓ 2-3 minutes to complete</li>
                </ul>
              </div>
              
              <Button
                onClick={() => setShowOnboardingForm(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 cursor-pointer"
              >
                Connect Bank Account
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Powered by Paystack. Your information is secure.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Form Dialog */}
        <Dialog open={showOnboardingForm} onOpenChange={setShowOnboardingForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Bank Account</DialogTitle>
              <DialogDescription>
                Enter your bank account details to receive payments
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleOnboard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business or account name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank">Bank *</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank} required>
                  <SelectTrigger id="bank">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setAccountNumber(value);
                        setAccountName(""); // Reset validation
                      }
                    }}
                    placeholder="10-digit account number"
                    maxLength={10}
                    required
                  />
                  <Button
                    type="button"
                    onClick={validateAccountNumber}
                    disabled={!selectedBank || accountNumber.length !== 10 || validating}
                    variant="outline"
                  >
                    {validating ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {accountName && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" />
                    {accountName}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Test Mode:</strong> Use any 10-digit number for testing.
                  The account name will be auto-generated.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOnboardingForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !accountName}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Account"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Onboarded and active
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-green-600" />
          <span>Payment Account Active</span>
        </CardTitle>
        <CardDescription>
          Your bank account is connected and ready to receive payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status</span>
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <BadgeCheck className="w-4 h-4" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Bank Account</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subaccount ID</span>
            <span className="font-mono text-xs">{user.paystackSubaccountCode}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Powered by Paystack • Funds are automatically transferred to your bank account
        </p>
      </CardContent>
    </Card>
  );
}
