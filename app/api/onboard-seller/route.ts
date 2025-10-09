import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { firebaseDb } from "@/firebase/admin";

/**
 * This route creates a Stripe Express account for a seller
 * and returns an onboarding URL.
 */
export async function POST(request: Request) {
  try {
    const { sellerId } = await request.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    // Check if user already has a Stripe account
    const userDoc = await firebaseDb.collection("users").doc(sellerId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    let accountId = userData?.stripeAccountId;

    // If no account exists, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: "individual",
      });

      accountId = account.id;

      // Save the account ID to Firebase
      await firebaseDb.collection("users").doc(sellerId).update({
        stripeAccountId: accountId,
        stripeOnboardingComplete: false,
      });
    }

    const origin = process.env.BASE_URL || request.headers.get("origin");

    // Generate an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/onboarding/refresh?sellerId=${sellerId}`,
      return_url: `${origin}/onboarding/complete?sellerId=${sellerId}`,
      type: "account_onboarding",
    });

    // Return the URL so the frontend can redirect
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating onboarding link:", error);
    return NextResponse.json({ error: "Failed to onboard seller" }, { status: 500 });
  }
}
