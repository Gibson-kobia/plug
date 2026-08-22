'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Truck, MessageCircle, AlertCircle, ArrowLeft,
  CheckCircle2, Clock, MapPin, User, Phone, Mail, FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { useCartStore } from '@/stores/cartStore';
import {
  NAIROBI_DELIVERY_ZONES,
  validateKenyanPhone,
  generateOrderReference,
  buildWhatsAppUrl,
  type WhatsAppOrderPayload,
  type DeliveryZone,
} from '@/lib/checkout/order';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    deliveryZoneId,
    setDeliveryZone,
    isPickup,
    setIsPickup,
    getSellerGroups,
    clearCart,
  } = useCartStore();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!mounted) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </div>
    );
  }

  const sellerGroups = getSellerGroups();
  const sellerKeys = Object.keys(sellerGroups);
  const currentZone = NAIROBI_DELIVERY_ZONES.find((z) => z.id === deliveryZoneId) ?? NAIROBI_DELIVERY_ZONES[0]!;
  const deliveryFee = isPickup ? 0 : currentZone.feeKes;

  let totalMarketRef = 0;
  items.forEach((item) => {
    if (typeof item.product.marketRefPriceKes === 'number') {
      totalMarketRef += item.product.marketRefPriceKes * item.quantity;
    }
  });

  if (items.length === 0) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center shadow-card">
          <p className="font-semibold text-heading">Your cart is empty</p>
          <p className="mt-1 text-sm text-neutral-500">Add products to your cart before proceeding to checkout.</p>
          <Link href="/search" className="mt-4 block">
            <Button className="w-full">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }

    if (!validateKenyanPhone(phone)) {
      setPhoneError('Please enter a valid Kenyan phone number (e.g. 0712345678 or 0110000000).');
      return;
    }
    setPhoneError('');

    setIsSubmitting(true);

    try {
      const { orderRef, signature } = generateOrderReference();

      // Store order details in session storage for the confirmation page
      const orderSummary = {
        orderRef,
        signature,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        deliveryZone: currentZone,
        deliveryAddress: address || (isPickup ? 'Self Pickup at Station' : currentZone.name),
        isPickup,
        items,
        sellerKeys,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min TTL
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`order_${orderRef}`, JSON.stringify(orderSummary));
      }

      // Generate WhatsApp links for seller groups
      const whatsappLinks: Record<string, string> = {};
      sellerKeys.forEach((key) => {
        const groupItems = sellerGroups[key] ?? [];
        const payload: WhatsAppOrderPayload = {
          orderRef,
          signature,
          customerName: name,
          customerPhone: phone,
          ...(email ? { customerEmail: email } : {}),
          deliveryZone: currentZone,
          deliveryAddress: address || (isPickup ? 'Self Pickup at Station' : currentZone.name),
          isPickup,
          sellerGroupKey: key,
          sellerPhone: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NO || process.env.NEXT_PUBLIC_DEFAULT_SELLER_WHATSAPP || '+254798021312',
          items: groupItems.map((gi) => {
            const base: { displayName: string; quantity: number; brand?: string; marketRefPriceKes?: number } = {
              displayName: gi.product.displayName,
              quantity: gi.quantity,
            };
            if (gi.product.brand) base.brand = gi.product.brand;
            if (typeof gi.product.marketRefPriceKes === 'number') base.marketRefPriceKes = gi.product.marketRefPriceKes;
            return base;
          }),
        };
        whatsappLinks[key] = buildWhatsAppUrl(payload);
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`order_wa_${orderRef}`, JSON.stringify(whatsappLinks));
      }

      // Clear cart and redirect to confirmation page
      clearCart();
      router.push(`/checkout/confirmation?orderRef=${orderRef}&sig=${signature}`);
    } catch (err) {
      console.error('[checkout] Order creation error:', err);
      alert('An error occurred while creating your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/cart" className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-heading sm:text-3xl lg:text-4xl">
            WhatsApp Guest Checkout
          </h1>
        </div>
        <Badge variant="warranty" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <ShieldCheck size={12} className="mr-1" /> No Signup Required
        </Badge>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-card sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
              <User size={20} className="text-copper-600" /> Customer Information
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Enter your details so sellers can confirm your order and arrange fulfillment.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="customer-name" className="block text-xs font-semibold text-neutral-700">Full Name *</label>
                <Input
                  id="customer-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="mt-1.5 h-11 text-sm"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="block text-xs font-semibold text-neutral-700">
                  Kenyan Mobile Number (WhatsApp-enabled) *
                </label>
                <Input
                  id="customer-phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="e.g. 0712345678 or 0110000000"
                  className="mt-1.5 h-11 text-sm"
                />
                {phoneError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle size={12} /> {phoneError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customer-email" className="block text-xs font-semibold text-neutral-700">
                  Email Address (Optional)
                </label>
                <Input
                  id="customer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="mt-1.5 h-11 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-card sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
              <Truck size={20} className="text-copper-600" /> Fulfillment & Delivery
            </h2>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPickup(false)}
                  className={`flex h-12 items-center justify-center rounded-2xl text-xs font-semibold border transition-all ${
                    !isPickup ? 'border-copper-500 bg-copper-50 text-copper-700 shadow-sm' : 'border-neutral-200 bg-white text-neutral-600'
                  }`}
                >
                  <Truck size={16} className="mr-2" /> Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setIsPickup(true)}
                  className={`flex h-12 items-center justify-center rounded-2xl text-xs font-semibold border transition-all ${
                    isPickup ? 'border-copper-500 bg-copper-50 text-copper-700 shadow-sm' : 'border-neutral-200 bg-white text-neutral-600'
                  }`}
                >
                  <ShieldCheck size={16} className="mr-2" /> Self Pickup
                </button>
              </div>

              {!isPickup && (
                <div>
                  <label htmlFor="zone-select" className="block text-xs font-semibold text-neutral-700">Delivery Zone *</label>
                  <select
                    id="zone-select"
                    value={deliveryZoneId}
                    onChange={(e) => setDeliveryZone(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
                  >
                    {NAIROBI_DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (+KSh {z.feeKes}) — ETA: {z.estimatedHours}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="delivery-address" className="block text-xs font-semibold text-neutral-700">
                  {isPickup ? 'Pickup Location Preference' : 'Delivery Address / Specific Building / Instructions'}
                </label>
                <textarea
                  id="delivery-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isPickup ? 'e.g. Preferred CBD pickup station' : 'e.g. Kimathi Street, Eagle House 3rd floor, Room 302'}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs placeholder:text-neutral-400 focus:border-copper-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-card sm:p-6">
              <h2 className="font-display text-lg font-bold text-heading">Order Preview</h2>

              <div className="mt-4 space-y-3">
                {sellerKeys.map((key, idx) => {
                  const groupItems = sellerGroups[key] ?? [];
                  return (
                    <div key={key} className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3 text-xs">
                      <p className="font-bold text-copper-700">Seller Group {idx + 1}: {key.replace('seller-', '').toUpperCase()}</p>
                      <ul className="mt-1.5 space-y-1 divide-y divide-neutral-100">
                        {groupItems.map(({ product, quantity }) => (
                          <li key={product.productId} className="flex justify-between pt-1 text-neutral-700">
                            <span className="truncate pr-2">{product.displayName} x{quantity}</span>
                            {typeof product.marketRefPriceKes === 'number' && (
                              <span className="font-medium shrink-0">KSh {(product.marketRefPriceKes * quantity).toLocaleString('en-KE')}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <div className="space-y-2 border-t border-neutral-100 pt-3 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Fulfillment:</span>
                    <span className="font-medium text-heading">{isPickup ? 'Self Pickup' : currentZone.name}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Fee:</span>
                    <span className="font-medium text-heading">{isPickup ? 'Free' : `KSh ${deliveryFee.toLocaleString('en-KE')}`}</span>
                  </div>
                  {totalMarketRef > 0 && (
                    <div className="flex justify-between text-sm font-bold text-heading pt-1 border-t border-neutral-100">
                      <span>Est. Market Ref Total:</span>
                      <span className="text-copper-600">KSh {(totalMarketRef + deliveryFee).toLocaleString('en-KE')}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="whatsapp"
                  disabled={isSubmitting}
                  className="mt-4 w-full h-14 text-base font-bold shadow-lg"
                >
                  <MessageCircle size={20} className="mr-2" />
                  {isSubmitting ? 'Generating Order…' : 'Confirm & Send via WhatsApp'}
                </Button>

                <p className="mt-2 text-center text-[11px] text-neutral-500">
                  Clicking will generate your unique HMAC-signed order reference and open WhatsApp to send details directly to the verified seller.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
