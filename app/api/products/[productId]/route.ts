// app/api/products/[productId]/route.ts
import { getProductById } from '@/lib/actions/product.action';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const { productId } = await params;

  const result = await getProductById(productId);

  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: 404 }
    );
  }

  return NextResponse.json(result.product);
}
