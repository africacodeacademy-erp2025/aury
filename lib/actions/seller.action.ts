"use server";

import { getCurrentUser } from "./auth.action";

/**
 * Get seller's Stripe onboarding status
 */
export async function getSellerOnboardingStatus() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    if (user.role !== "creator" && user.role !== "craft-business") {
      return {
        success: false,
        message: "Only sellers can access onboarding",
      };
    }

    return {
      success: true,
      hasStripeAccount: !!user.stripeAccountId,
      onboardingComplete: user.stripeOnboardingComplete || false,
      stripeAccountId: user.stripeAccountId,
    };
  } catch (error) {
    console.error("Error getting seller onboarding status:", error);
    return {
      success: false,
      message: "Failed to get onboarding status",
    };
  }
}
