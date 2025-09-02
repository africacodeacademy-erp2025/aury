import { NextRequest, NextResponse } from 'next/server';
import { createPost, getPosts } from '@/lib/actions/community.action';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, imageUrl } = body;

    const result = await createPost({ content, imageUrl });

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await getPosts();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', posts: [] },
      { status: 500 }
    );
  }
}