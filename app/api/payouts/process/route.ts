import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";
import { sendPayout, calculatePayoutFee } from "@/lib/paypal";

/**
 * Process payouts for a specific seller
 * This calculates their earnings and sends a PayPal payout
 */
export async function POST(request: Request) {
  try {
    const { sellerId, amount, currency = "USD", note } = await request.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Get seller information
    const userDoc = await firebaseDb.collection("users").doc(sellerId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const paypalEmail = userData?.paypalEmail;

    if (!paypalEmail) {
      return NextResponse.json(
        { error: "Seller has no PayPal email configured" },
        { status: 400 }
      );
    }

    if (!userData?.onboardingComplete) {
      return NextResponse.json(
        { error: "Seller has not completed onboarding" },
        { status: 400 }
      );
    }

    // Calculate PayPal fee
    const payoutFee = calculatePayoutFee(amount, false);
    const netAmount = amount - payoutFee;

    // Send payout via PayPal
    const payoutResult = await sendPayout(
      paypalEmail,
      netAmount,
      currency,
      note || `Earnings payout from Aury - ${new Date().toLocaleDateString()}`,
      sellerId
    );

    if (!payoutResult.success) {
      return NextResponse.json(
        { error: payoutResult.error || "Failed to process payout" },
        { status: 500 }
      );
    }

    // Record the payout in Firebase
    const payoutRecord = {
      sellerId,
      paypalEmail,
      amount,
      payoutFee,
      netAmount,
      currency,
      status: payoutResult.status,
      batchId: payoutResult.batchId,
      createdAt: new Date().toISOString(),
      method: "paypal",
    };

    await firebaseDb.collection("payouts").add(payoutRecord);

    // Update seller's last payout date
    await firebaseDb.collection("users").doc(sellerId).update({
      lastPayoutAt: new Date().toISOString(),
      lastPayoutAmount: netAmount,
    });

    return NextResponse.json({
      success: true,
      batchId: payoutResult.batchId,
      status: payoutResult.status,
      netAmount,
      payoutFee,
      message: `Payout of ${currency} ${netAmount.toFixed(2)} sent to ${paypalEmail}`,
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 }
    );
  }
}

/**
 * Get payout history for a seller
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    // Get all payouts for this seller
    const payoutsSnapshot = await firebaseDb
      .collection("payouts")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const payouts = payoutsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      payouts,
      total: payouts.length,
    });
  } catch (error) {
    console.error("Error fetching payout history:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout history" },
      { status: 500 }
    );
  }
}
