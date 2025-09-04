import { NextRequest, NextResponse } from 'next/server';
import { createProduct, getProducts } from '@/lib/actions/product.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      originalPrice, 
      category, 
      imageUrl, 
      stock,
      materials,
      difficulty,
      tags 
    } = body;

    const result = await createProduct({
      name,
      description,
      price,
      originalPrice,
      category,
      imageUrl,
      stock,
      materials,
      difficulty,
      tags,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = searchParams.get('sortBy') as 'newest' | 'price_asc' | 'price_desc' | 'popular' || undefined;

    const result = await getProducts({
      category,
      minPrice,
      maxPrice,
      sortBy,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', products: [] },
      { status: 500 }
    );
  }
}