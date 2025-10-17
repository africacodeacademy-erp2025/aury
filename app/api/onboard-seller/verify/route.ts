import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";

/**
 * This route verifies the PayPal onboarding status for a seller
 * Since PayPal onboarding is instant (just email), this just checks if they have a PayPal email
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
    const paypalEmail = userData?.paypalEmail;
    const onboardingComplete = userData?.onboardingComplete || false;

    if (!paypalEmail) {
      return NextResponse.json({
        success: false,
        onboardingComplete: false,
        message: "No PayPal email found. Please complete onboarding.",
      });
    }

    return NextResponse.json({
      success: true,
      onboardingComplete,
      paypalEmail: paypalEmail,
      payoutMethod: userData?.payoutMethod || "paypal",
    });
  } catch (error) {
    console.error("Error verifying onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to verify onboarding status" },
      { status: 500 }
    );
  }
}
