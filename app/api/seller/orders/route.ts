import { NextRequest, NextResponse } from 'next/server';
import { getSellerOrders } from '@/lib/actions/order.action';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = searchParams.get('status') as any;

    const result = await getSellerOrders(page, limit, status);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/seller/orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}