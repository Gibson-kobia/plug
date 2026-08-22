import { NextRequest, NextResponse } from 'next/server';
import { getAdminDeliverySettings } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const data = await getAdminDeliverySettings();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { zones: [], pickupLocations: [], dbConnected: false, error: err.message },
      { status: 500 }
    );
  }
}
