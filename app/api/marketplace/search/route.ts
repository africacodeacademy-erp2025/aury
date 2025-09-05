import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/actions/marketplace.action';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchParams_obj: MarketplaceSearchParams = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sellerType: searchParams.get('sellerType') as 'creator' | 'craft-business' || undefined,
      sellerId: searchParams.get('sellerId') || undefined,
      productType: searchParams.get('productType') as 'pattern' | 'physical' || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortBy: searchParams.get('sortBy') as any || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
    };

    const result = await searchProducts(searchParams_obj);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/marketplace/search:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}