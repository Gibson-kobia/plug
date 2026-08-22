import { NextResponse } from 'next/server';
import { getAdminDashboardMetrics } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getAdminDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (err: any) {
    return NextResponse.json(
      {
        pendingListings: 0,
        pendingKyc: 0,
        ordersRequiringFulfillment: 0,
        activeSellers: 0,
        activeListings: 0,
        pendingOrders: 0,
        dbConnected: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
