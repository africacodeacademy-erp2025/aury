import { NextResponse } from "next/server";
import { addToCart } from "@/lib/actions/cart.action";

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
    }
    const result = await addToCart(productId, quantity ?? 1);
    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (e) {
    console.error("/api/cart POST error:", e);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
