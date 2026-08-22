import { NextResponse } from 'next/server';
import { getCategoryStats } from '@/lib/product-data';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  try {
    const stats = getCategoryStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
