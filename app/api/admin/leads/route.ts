import { NextRequest, NextResponse } from 'next/server';
import { requirePermissionOrThrow } from '@/lib/auth/require';
import { getAdminLeads } from '@/lib/admin/queries';

export async function GET(req: NextRequest) {
  try {
    await requirePermissionOrThrow('users.manage');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await getAdminLeads(status, query, limit);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
