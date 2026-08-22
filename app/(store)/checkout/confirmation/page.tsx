'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, ShieldCheck, MessageCircle, Clock, AlertTriangle,
  Copy, ExternalLink, ArrowRight, Package, Home,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { generateOrderRefSignature } from '@/lib/checkout/order';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams?.get('orderRef') || '';
  const sig = searchParams?.get('sig') || '';

  const [orderData, setOrderData] = React.useState<any>(null);
  const [waLinks, setWaLinks] = React.useState<Record<string, string>>({});
  const [copied, setCopied] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(15 * 60); // 15 minutes TTL

  React.useEffect(() => {
    if (typeof window === 'undefined' || !orderRef) return;

    const rawOrder = sessionStorage.getItem(`order_${orderRef}`);
    const rawWa = sessionStorage.getItem(`order_wa_${orderRef}`);

    if (rawOrder) {
      try {
        setOrderData(JSON.parse(rawOrder));
      } catch (e) {
        console.error('Failed to parse order session data:', e);
      }
    }
    if (rawWa) {
      try {
        setWaLinks(JSON.parse(rawWa));
      } catch (e) {
        console.error('Failed to parse WA links:', e);
      }
    }
  }, [orderRef]);

  // 15-minute TTL timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isValidSignature = orderRef && sig && generateOrderRefSignature(orderRef) === sig;

  if (!orderRef || !sig || !isValidSignature) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-rose-300 bg-rose-50/50 p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle size={32} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-heading">Invalid Order Reference</h1>
          <p className="mt-2 text-xs text-neutral-600">
            The requested order reference signature could not be verified. Please verify your order link or place a new order.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const copyRef = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(orderRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sellerKeys = Object.keys(waLinks);

  return (
    <div id="main" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-card">
        <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-copper-900 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="verified" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <CheckCircle2 size={12} className="mr-1" /> Order Reference Created
            </Badge>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-copper-300 backdrop-blur-sm">
              <Clock size={14} className="animate-pulse" /> TTL Reservation: {timerDisplay}
            </div>
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
            Order Reference #{orderRef}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
            <span>Signature Verified: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-copper-300">{sig}</code></span>
            <span>·</span>
            <span>Customer: {orderData?.customerName || 'Guest'}</span>
            <span>·</span>
            <span>Phone: {orderData?.customerPhone || '—'}</span>
          </div>
        </div>

        <div className="p-6 space-y-6 sm:p-8">
          <div className="rounded-2xl border border-copper-100 bg-copper-50/60 p-4 text-xs text-copper-900 sm:p-5">
            <h2 className="font-bold text-sm text-copper-800 flex items-center gap-1.5">
              <MessageCircle size={16} /> Action Required: Launch WhatsApp to Confirm Order
            </h2>
            <p className="mt-1 text-copper-700">
              Click the button(s) below to open WhatsApp with your prefilled order details and send them directly to the verified seller(s).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Fulfillment Contacts ({sellerKeys.length || 1} Seller Groups)
            </h3>

            {sellerKeys.length > 0 ? (
              sellerKeys.map((key, idx) => (
                <div key={key} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-copper-600">
                      Seller Group {idx + 1}
                    </span>
                    <h4 className="font-semibold text-heading text-sm">
                      {key.replace('seller-', '').toUpperCase()} Seller
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Direct WhatsApp order launch for items in this group
                    </p>
                  </div>
                  <a
                    href={waLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button variant="whatsapp" size="lg" className="w-full sm:w-auto">
                      <MessageCircle size={18} className="mr-2" />
                      Send Group {idx + 1} via WhatsApp
                    </Button>
                  </a>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-neutral-200 p-4 text-center">
                <a
                  href={`https://wa.me/${(process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NO || '254798021312').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Plugke, I created Order ' + orderRef)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="whatsapp" size="lg" className="w-full sm:w-auto">
                    <MessageCircle size={18} className="mr-2" />
                    Open WhatsApp Support
                  </Button>
                </a>
              </div>
            )}
          </div>

          {orderData && (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 space-y-3 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Order Summary</h3>
              <div className="text-xs space-y-1 text-neutral-700">
                <p><span className="font-semibold text-neutral-900">Fulfillment Method:</span> {orderData.isPickup ? 'Self Pickup' : 'Delivery to ' + orderData.deliveryZone?.name}</p>
                <p><span className="font-semibold text-neutral-900">Address / Instructions:</span> {orderData.deliveryAddress}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-heading">Copy Order Reference</p>
              <p className="text-[11px] text-neutral-500">Use this reference if you contact customer support directly.</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyRef} className="shrink-0">
              <Copy size={14} className="mr-1.5" />
              {copied ? 'Copied!' : 'Copy Reference'}
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/search">
              <Button variant="outline">
                <Package size={16} className="mr-1.5" /> Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <Home size={16} className="mr-1.5" /> Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-card">Loading order details...</div></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
