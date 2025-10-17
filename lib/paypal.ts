import paypal from "@paypal/payouts-sdk";

/**
 * PayPal Payouts Configuration
 * Used for sending payments to sellers
 */

// Configure PayPal environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  // Use sandbox for development, live for production
  if (process.env.NODE_ENV === "production") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

// Create PayPal client
export function paypalClient() {
  return new paypal.core.PayPalHttpClient(environment());
}

/**
 * Send a payout to a seller via PayPal
 * @param paypalEmail - Seller's PayPal email address
 * @param amount - Amount to send in USD or other currency
 * @param currency - Currency code (default: USD)
 * @param note - Optional note for the payout
 * @param sellerId - Seller's user ID for tracking
 */
export async function sendPayout(
  paypalEmail: string,
  amount: number,
  currency: string = "USD",
  note: string = "Earnings payout from Aury",
  sellerId: string
) {
  try {
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: `batch_${sellerId}_${Date.now()}`, // Unique batch ID
        email_subject: "You have a payout from Aury!",
        email_message: "You have received a payout! Thank you for being a seller on Aury.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount.toFixed(2),
            currency: currency,
          },
          note: note,
          sender_item_id: `payout_${sellerId}_${Date.now()}`, // Unique item ID
          receiver: paypalEmail,
        },
      ],
    });

    const response = await paypalClient().execute(request);
    
    return {
      success: true,
      batchId: response.result?.batch_header?.payout_batch_id || "",
      status: response.result?.batch_header?.batch_status || "PENDING",
      data: response.result,
    };
  } catch (error: unknown) {
    console.error("PayPal payout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process payout";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get payout batch details
 * @param batchId - The PayPal batch ID to check
 */
export async function getPayoutBatchDetails(batchId: string) {
  try {
    const request = new paypal.payouts.PayoutsGetRequest(batchId);
    const response = await paypalClient().execute(request);
    
    return {
      success: true,
      data: response.result,
    };
  } catch (error: unknown) {
    console.error("PayPal batch details error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get batch details";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate a PayPal email (basic format check)
 * @param email - Email to validate
 */
export function validatePayPalEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate PayPal payout fee
 * Domestic: 2% (max $1)
 * International: 2% (max $20)
 */
export function calculatePayoutFee(amount: number, isInternational: boolean = false): number {
  const feePercentage = 0.02;
  const fee = amount * feePercentage;
  const maxFee = isInternational ? 20 : 1;
  return Math.min(fee, maxFee);
}
