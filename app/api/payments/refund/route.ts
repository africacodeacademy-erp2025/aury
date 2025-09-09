import { NextRequest, NextResponse } from 'next/server';
import { processRefund } from '@/lib/actions/payment.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const result = await processRefund(orderId, amount, reason);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/payments/refund:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}