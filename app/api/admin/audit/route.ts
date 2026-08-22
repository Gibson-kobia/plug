import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuditLogs } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const data = await getAdminAuditLogs(limit, action);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { items: [], dbConnected: false, error: err.message },
      { status: 500 }
    );
  }
}
