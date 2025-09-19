import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
    return new Response(
        JSON.stringify({
            message: "We reached payment routes",
            success: true,
        })
    )
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const baseUrl = process.env.BASE_URL || request.headers.get("origin");
        const product = await fetch(`${baseUrl}/api/products/${data.productId}`).then(res => res.json());
        console.log("Product in payment route:", product);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const session = await stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [
                {
                    price_data: {
                        unit_amount: product.price * 100,
                        currency: "bwp",
                        product_data: {
                            name: product.name,
                            images: ["https://joel-portfolio.web.app/images/about-img.jpg"], // FIXME: change imageUrl from firebase collection to a hosting service (vercel, cloudinary)
                        },
                    },
                    quantity: 1,
                }
            ],
            payment_method_types: ["card"],
            mode: "payment",
            automatic_tax: { enabled: true },
            return_url: `${request.headers.get("origin")}/marketplace/paymentResult?session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json({ id: session.id, client_secret: session.client_secret });
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error: "Internal Server Error"
        }, {
            status: 500
        })
    }
}