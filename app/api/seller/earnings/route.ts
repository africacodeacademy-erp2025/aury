import { NextRequest, NextResponse } from 'next/server';
import { getSellerEarnings, getEarningsAnalytics } from '@/lib/actions/earnings.action';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analytics = searchParams.get('analytics') === 'true';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    if (analytics) {
      const result = await getEarningsAnalytics(startDate, endDate);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    } else {
      const result = await getSellerEarnings();
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/seller/earnings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}