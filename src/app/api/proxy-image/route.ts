import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('missing url', { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new NextResponse('not found', { status: 404 });
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new NextResponse('error', { status: 500 });
  }
}
