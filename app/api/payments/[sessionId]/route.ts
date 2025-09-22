import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching session: ", error);
    return NextResponse.json(
      { error: "Unable to fetch session" },
      { status: 500 }
    );
  }
}
