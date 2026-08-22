import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const stkCallback = rawBody?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid payload structure' });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    let mpesaReceiptNumber: string | null = null;
    let amountPaid: number | null = null;
    let phoneNumber: string | null = null;

    if (CallbackMetadata?.Item && Array.isArray(CallbackMetadata.Item)) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value);
        if (item.Name === 'Amount') amountPaid = Number(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      }
    }

    const isSuccess = ResultCode === 0;
    const status = isSuccess ? 'completed' : ResultCode === 1032 ? 'cancelled_by_user' : 'failed';

    const supabase = createAdminClient();

    // Update mpesa_transactions
    const { data: updatedTx, error: txErr } = await supabase
      .from('mpesa_transactions')
      .update({
        status,
        mpesa_receipt_number: mpesaReceiptNumber,
        result_code: ResultCode,
        result_desc: ResultDesc,
        raw_callback_json: rawBody,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', CheckoutRequestID)
      .select('order_ref')
      .single();

    if (txErr) {
      console.warn('[Daraja Callback] Failed to update tx:', txErr.message);
    }

    // If payment succeeded, update order status to payment_confirmed
    if (isSuccess && updatedTx?.order_ref) {
      await supabase
        .from('orders')
        .update({
          status: 'payment_confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_ref', updatedTx.order_ref);

      // Record in audit log
      await supabase.from('audit_logs').insert({
        actor_system: 'safaricom_daraja_webhook',
        action: 'order.payment_confirmed',
        target_type: 'order',
        target_id: updatedTx.order_ref,
        after: {
          mpesaReceiptNumber,
          amountPaid,
          checkoutRequestId: CheckoutRequestID,
        },
      });
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed and recorded successfully.',
    });
  } catch (err: any) {
    console.error('[Daraja Callback] Error:', err);
    return NextResponse.json({ ResultCode: 1, ResultDesc: err.message || 'Internal error' });
  }
}
