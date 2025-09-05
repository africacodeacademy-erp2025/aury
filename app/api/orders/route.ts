import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/actions/order.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems, shippingAddress } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart items are required' },
        { status: 400 }
      );
    }

    const result = await createOrder(cartItems, shippingAddress);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = searchParams.get('status') as any;

    const result = await getOrders(page, limit, status);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}