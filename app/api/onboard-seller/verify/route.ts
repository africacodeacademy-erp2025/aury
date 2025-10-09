import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { firebaseDb } from "@/firebase/admin";

/**
 * This route verifies the Stripe onboarding status for a seller
 * and updates the database accordingly.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    // Get user from Firebase
    const userDoc = await firebaseDb.collection("users").doc(sellerId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const stripeAccountId = userData?.stripeAccountId;

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe account found for this seller" },
        { status: 404 }
      );
    }

    // Retrieve the account from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Check if onboarding is complete
    const onboardingComplete = account.details_submitted || false;

    // Update Firebase with the onboarding status
    await firebaseDb.collection("users").doc(sellerId).update({
      stripeOnboardingComplete: onboardingComplete,
      stripeChargesEnabled: account.charges_enabled || false,
      stripePayoutsEnabled: account.payouts_enabled || false,
    });

    return NextResponse.json({
      success: true,
      onboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (error) {
    console.error("Error verifying onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to verify onboarding status" },
      { status: 500 }
    );
  }
}
