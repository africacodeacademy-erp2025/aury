import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { firebaseDb } from "@/firebase/admin";
import { headers } from "next/headers";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Webhook handler for Stripe events
 * Handles payment completion, account updates, and more
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "charge.succeeded":
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout session completed:", session.id);

  const productId = session.metadata?.productId;
  const productType = session.metadata?.productType;

  if (!productId) {
    console.error("No productId in session metadata");
    return;
  }

  // Get product details
  const productDoc = await firebaseDb.collection("products").doc(productId).get();
  if (!productDoc.exists) {
    console.error("Product not found:", productId);
    return;
  }

  const product = productDoc.data();
  if (!product) return;

  // Create order record
  const orderData = {
    sessionId: session.id,
    productId,
    productName: product.name,
    productType: productType || "physical",
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    customerId: session.client_reference_id || "guest",
    customerEmail: session.customer_details?.email || "",
    amount: session.amount_total || 0,
    currency: session.currency || "bwp",
    status: "paid",
    paymentStatus: session.payment_status,
    createdAt: FieldValue.serverTimestamp(),
  };

  await firebaseDb.collection("orders").add(orderData);

  // Update product sales count
  await firebaseDb.collection("products").doc(productId).update({
    salesCount: FieldValue.increment(1),
  });

  console.log("Order created successfully for session:", session.id);
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment intent succeeded:", paymentIntent.id);
  
  // You can add additional logic here, such as:
  // - Sending confirmation emails
  // - Triggering fulfillment processes
  // - Updating analytics
}

/**
 * Handle account updates (e.g., onboarding status changes)
 */
async function handleAccountUpdated(account: Stripe.Account) {
  console.log("Account updated:", account.id);

  // Find the user with this Stripe account ID
  const usersSnapshot = await firebaseDb
    .collection("users")
    .where("stripeAccountId", "==", account.id)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log("No user found for Stripe account:", account.id);
    return;
  }

  const userDoc = usersSnapshot.docs[0];

  // Update the user's onboarding status
  await userDoc.ref.update({
    stripeOnboardingComplete: account.details_submitted || false,
    stripeChargesEnabled: account.charges_enabled || false,
    stripePayoutsEnabled: account.payouts_enabled || false,
  });

  console.log("Updated user account status for:", userDoc.id);
}

/**
 * Handle successful charges
 */
async function handleChargeSucceeded(charge: Stripe.Charge) {
  console.log("Charge succeeded:", charge.id);

  // Track platform earnings
  if (charge.application_fee_amount) {
    const earningsData = {
      chargeId: charge.id,
      amount: charge.amount,
      applicationFee: charge.application_fee_amount,
      currency: charge.currency,
      sellerId: charge.transfer_data?.destination || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    await firebaseDb.collection("platformEarnings").add(earningsData);
    console.log("Platform earnings tracked for charge:", charge.id);
  }
}
