import { NextRequest, NextResponse } from 'next/server';
import { getModerationQueue } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending_review';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const data = await getModerationQueue(status, limit);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { items: [], dbConnected: false, error: err.message },
      { status: 500 }
    );
  }
}
