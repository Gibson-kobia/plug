import { NextRequest, NextResponse } from 'next/server';
import { queryStkStatus } from '@/lib/mpesa/daraja';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, error: 'checkoutRequestId is required' },
        { status: 400 }
      );
    }

    const result = await queryStkStatus(checkoutRequestId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
