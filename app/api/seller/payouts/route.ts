import { NextRequest, NextResponse } from 'next/server';
import { requestPayout, getPayoutHistory } from '@/lib/actions/earnings.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, paymentDetails } = body;

    if (!amount || !paymentMethod || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: 'Amount, payment method, and payment details are required' },
        { status: 400 }
      );
    }

    const result = await requestPayout(amount, paymentMethod, paymentDetails);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/seller/payouts:', error);
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

    const result = await getPayoutHistory(page, limit);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/seller/payouts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}