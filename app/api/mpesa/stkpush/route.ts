import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa/daraja';
import { validateKenyanPhone } from '@/lib/checkout/order';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderRef, phoneNumber, amountKes, accountReference } = body;

    if (!orderRef || !phoneNumber || !amountKes) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: orderRef, phoneNumber, amountKes' },
        { status: 400 }
      );
    }

    if (!validateKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Kenyan phone number format. Provide a valid 07XX or 01XX number.' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amountKes);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount.' },
        { status: 400 }
      );
    }

    const result = await initiateStkPush({
      orderRef,
      phoneNumber,
      amountKes: numericAmount,
      accountReference,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to trigger M-PESA STK Push.' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[MPESA STK Route] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
