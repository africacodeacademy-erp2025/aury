import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  return new Response(
    JSON.stringify({
      message: "We reached payment routes",
      success: true,
    })
  );
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const baseUrl = process.env.BASE_URL || request.headers.get("origin");
    const productUrl = `${baseUrl}/api/products/${data.productId}`;

    const productResponse = await fetch(productUrl).then((res) => res.json());
    
    if (!productResponse.success || !productResponse.product) {
      console.error("Product not found:", productResponse);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productResponse.product;

    // Get seller's Stripe account ID from Firebase
    const { firebaseDb } = await import("@/firebase/admin");
    const sellerDoc = await firebaseDb.collection("users").doc(product.sellerId).get();
    
    if (!sellerDoc.exists) {
      console.error("Seller not found:", product.sellerId);
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const sellerData = sellerDoc.data();
    const sellerStripeAccountId = sellerData?.stripeAccountId;

    if (!sellerStripeAccountId) {
      return NextResponse.json(
        { error: "Seller has not completed Stripe onboarding" },
        { status: 400 }
      );
    }

    if (!sellerData?.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: "Seller onboarding is incomplete" },
        { status: 400 }
      );
    }

    const platformFee = Math.round(product.price * 0.05 * 100); // 5% platform fee in cents

    console.log("Creating checkout session:", {
      productName: product.name,
      price: product.price,
      platformFee: platformFee / 100,
      sellerAccountId: sellerStripeAccountId.substring(0, 20) + "..."
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price_data: {
            unit_amount: product.price * 100,
            currency: "bwp",
            product_data: {
              name: product.name,
              images: [
                product.imageUrl
                  ? product.imageUrl
                  : "https://placehold.co/400",
              ],
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      automatic_tax: { enabled: true },
      return_url: `${request.headers.get(
        "origin"
      )}/marketplace/paymentResult?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: data.customerId || undefined,
      // Send the payment to the seller but keep your fee
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },

      metadata: {
        productId: data.productId,
        productType: product.productType || "physical",
      },
    });


    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error) {
    console.error("Payment route error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
