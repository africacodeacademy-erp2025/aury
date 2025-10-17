import { NextResponse } from "next/server";
import { firebaseDb } from "@/firebase/admin";
import { sendPayout, calculatePayoutFee } from "@/lib/paypal";

/**
 * Admin endpoint to trigger payouts for all eligible sellers
 * This can be run manually or set up as a cron job
 */
export async function POST(request: Request) {
  try {
    const {
      minimumPayout = 10, // Minimum amount to trigger payout
      currency = "USD",
      dryRun = false, // Set to true to see who would get paid without actually paying
    } = await request.json();

    // Get all sellers who have completed onboarding
    const sellersSnapshot = await firebaseDb
      .collection("users")
      .where("onboardingComplete", "==", true)
      .where("payoutMethod", "==", "paypal")
      .get();

    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      totalAmount: 0,
      details: [] as Array<{
        sellerId: string;
        paypalEmail?: string;
        earnings?: number;
        netAmount?: number;
        payoutFee?: number;
        batchId?: string;
        status: string;
        reason?: string;
        message?: string;
        error?: string;
      }>,
    };

    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id;
      const sellerData = sellerDoc.data();
      const paypalEmail = sellerData.paypalEmail;

      if (!paypalEmail) {
        results.skipped++;
        results.details.push({
          sellerId,
          status: "skipped",
          reason: "No PayPal email",
        });
        continue;
      }

      // Calculate earnings for this seller
      // This is a simplified version - you'll need to implement your own earnings calculation
      const earnings = await calculateSellerEarnings(sellerId);

      if (earnings < minimumPayout) {
        results.skipped++;
        results.details.push({
          sellerId,
          paypalEmail,
          earnings,
          status: "skipped",
          reason: `Below minimum payout of ${currency} ${minimumPayout}`,
        });
        continue;
      }

      if (dryRun) {
        results.details.push({
          sellerId,
          paypalEmail,
          earnings,
          status: "dry-run",
          message: `Would pay ${currency} ${earnings.toFixed(2)}`,
        });
        results.processed++;
        results.totalAmount += earnings;
        continue;
      }

      // Process the payout
      const payoutFee = calculatePayoutFee(earnings, false);
      const netAmount = earnings - payoutFee;

      const payoutResult = await sendPayout(
        paypalEmail,
        netAmount,
        currency,
        `Earnings payout from Aury - ${new Date().toLocaleDateString()}`,
        sellerId
      );

      if (payoutResult.success) {
        // Record the payout
        await firebaseDb.collection("payouts").add({
          sellerId,
          paypalEmail,
          amount: earnings,
          payoutFee,
          netAmount,
          currency,
          status: payoutResult.status,
          batchId: payoutResult.batchId,
          createdAt: new Date().toISOString(),
          method: "paypal",
          triggeredBy: "admin",
        });

        // Update seller's last payout date and reset earnings
        await firebaseDb.collection("users").doc(sellerId).update({
          lastPayoutAt: new Date().toISOString(),
          lastPayoutAmount: netAmount,
          // If you track pending earnings, reset them here
          // pendingEarnings: 0,
        });

        results.processed++;
        results.totalAmount += netAmount;
        results.details.push({
          sellerId,
          paypalEmail,
          earnings,
          netAmount,
          payoutFee,
          batchId: payoutResult.batchId,
          status: "success",
        });
      } else {
        results.failed++;
        results.details.push({
          sellerId,
          paypalEmail,
          earnings,
          status: "failed",
          error: payoutResult.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        processed: results.processed,
        skipped: results.skipped,
        failed: results.failed,
        totalAmount: results.totalAmount,
        currency,
      },
      details: results.details,
    });
  } catch (error) {
    console.error("Error triggering payouts:", error);
    return NextResponse.json(
      { error: "Failed to trigger payouts" },
      { status: 500 }
    );
  }
}

/**
 * Calculate total earnings for a seller
 * TODO: Implement your own logic based on your business model
 */
async function calculateSellerEarnings(sellerId: string): Promise<number> {
  try {
    // Example: Calculate from completed orders
    const ordersSnapshot = await firebaseDb
      .collection("orders")
      .where("sellerId", "==", sellerId)
      .where("status", "==", "completed")
      .where("payoutProcessed", "==", false)
      .get();

    let totalEarnings = 0;

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const platformFeePercentage = parseFloat(
        process.env.PLATFORM_FEE_PERCENTAGE || "5"
      );
      const orderTotal = orderData.total || 0;
      const sellerEarnings = orderTotal * (1 - platformFeePercentage / 100);
      totalEarnings += sellerEarnings;
    }

    return totalEarnings;
  } catch (error) {
    console.error(`Error calculating earnings for seller ${sellerId}:`, error);
    return 0;
  }
}

/**
 * GET endpoint to check pending payouts without processing
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minimumPayout = parseFloat(searchParams.get("minimumPayout") || "10");

    // Get all sellers who have completed onboarding
    const sellersSnapshot = await firebaseDb
      .collection("users")
      .where("onboardingComplete", "==", true)
      .where("payoutMethod", "==", "paypal")
      .get();

    const pendingPayouts = [];
    let totalPending = 0;

    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerId = sellerDoc.id;
      const sellerData = sellerDoc.data();
      const earnings = await calculateSellerEarnings(sellerId);

      if (earnings >= minimumPayout) {
        pendingPayouts.push({
          sellerId,
          paypalEmail: sellerData.paypalEmail,
          earnings,
          name: sellerData.name || "Unknown",
        });
        totalPending += earnings;
      }
    }

    return NextResponse.json({
      success: true,
      totalSellers: pendingPayouts.length,
      totalAmount: totalPending,
      minimumPayout,
      sellers: pendingPayouts,
    });
  } catch (error) {
    console.error("Error fetching pending payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending payouts" },
      { status: 500 }
    );
  }
}
