import { NextRequest, NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/actions/payment.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentIntentId } = body;

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, message: 'Order ID and payment intent ID are required' },
        { status: 400 }
      );
    }

    const result = await confirmPayment(orderId, paymentIntentId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/payments/confirm:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}