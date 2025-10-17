import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";
import { validatePayPalEmail } from "@/lib/paypal";

/**
 * This route saves a seller's PayPal email for payouts
 * Simple and fast onboarding - just collect PayPal email!
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);
    
    const { sellerId, paypalEmail } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    if (!paypalEmail) {
      console.log("PayPal email is missing. Body received:", body);
      return NextResponse.json({ error: "Missing PayPal email" }, { status: 400 });
    }

    // Validate PayPal email format
    if (!validatePayPalEmail(paypalEmail)) {
      return NextResponse.json(
        { error: "Invalid PayPal email format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userDoc = await firebaseDb.collection("users").doc(sellerId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save PayPal email and mark onboarding as complete
    await firebaseDb.collection("users").doc(sellerId).update({
      paypalEmail: paypalEmail.toLowerCase().trim(),
      payoutMethod: "paypal",
      onboardingComplete: true,
      onboardedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "PayPal email saved successfully! You can now receive payouts.",
    });
  } catch (error) {
    console.error("Error saving PayPal email:", error);
    return NextResponse.json(
      { error: "Failed to save PayPal email" },
      { status: 500 }
    );
  }
}
