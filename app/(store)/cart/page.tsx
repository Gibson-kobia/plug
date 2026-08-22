'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck,
  Truck, ArrowLeft, Clock, Info, CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Price } from '@/components/ui/price';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { NAIROBI_DELIVERY_ZONES } from '@/lib/checkout/order';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    deliveryZoneId,
    setDeliveryZone,
    isPickup,
    setIsPickup,
    getSellerGroups,
  } = useCartStore();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

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
  let hasMarketRefPrices = false;

  items.forEach((item) => {
    if (typeof item.product.marketRefPriceKes === 'number') {
      totalMarketRef += item.product.marketRefPriceKes * item.quantity;
      hasMarketRefPrices = true;
    }
  });

  if (items.length === 0) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center shadow-card sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-copper-50 text-copper-600">
            <ShoppingBag size={32} strokeWidth={1.5} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-heading">Your Cart is Empty</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Explore 13 electronics categories and find your device from verified Kenyan sellers.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/search">
              <Button size="lg" className="w-full">
                Browse All Products
                <ArrowRight size={16} strokeWidth={2} />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl lg:text-4xl">
            Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {sellerKeys.length > 1
              ? `Items split across ${sellerKeys.length} seller fulfillment groups`
              : 'Direct checkout with verified seller via WhatsApp'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="self-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:self-auto">
          <Trash2 size={14} /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {sellerKeys.map((key, groupIdx) => {
            const groupItems = sellerGroups[key] ?? [];
            const sellerLabel = key.replace('seller-', '').toUpperCase();
            return (
              <div key={key} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-card">
                <div className="border-b border-neutral-100 bg-neutral-50/70 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-copper-500 text-[10px] font-bold text-white">
                      {groupIdx + 1}
                    </span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-heading">
                      Fulfillment Group: {sellerLabel}
                    </h2>
                  </div>
                  <Badge variant="warranty" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 size={10} className="mr-1" /> Direct Seller Contact
                  </Badge>
                </div>

                <div className="divide-y divide-neutral-100">
                  {groupItems.map(({ product, quantity }) => (
                    <div key={product.productId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-50 border border-neutral-100 sm:h-24 sm:w-24">
                        <img
                          src={product.primaryImageUrl}
                          alt={product.displayName}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        {product.brand && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-copper-600">
                            {product.brand}
                          </span>
                        )}
                        <Link href={`/product/${product.slug}`} className="font-semibold text-heading hover:text-copper-600 line-clamp-1">
                          {product.displayName}
                        </Link>
                        <p className="text-xs text-neutral-500">{product.categoryName || 'Electronics'}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          {product.marketPriceStatus === 'VERIFIED' && typeof product.marketRefPriceKes === 'number' ? (
                            <div>
                              <span className="block text-[10px] font-semibold uppercase tracking-wider text-copper-600">
                                Market Ref Price
                              </span>
                              <Price amount={product.marketRefPriceKes * quantity} size="sm" />
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-neutral-600">Price on inquiry</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3 sm:border-t-0 sm:pt-0">
                        <div className="flex items-center rounded-xl border border-neutral-200 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.productId, quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-copper-600"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-heading">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.productId, quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-copper-600"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(product.productId)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-card sm:p-6">
              <h2 className="font-display text-lg font-bold text-heading">Order Summary</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="delivery-zone-select" className="block text-xs font-semibold text-neutral-700">Fulfillment Method</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPickup(false)}
                      className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold border transition-all ${
                        !isPickup ? 'border-copper-500 bg-copper-50 text-copper-700 shadow-sm' : 'border-neutral-200 bg-white text-neutral-600'
                      }`}
                    >
                      <Truck size={14} className="mr-1.5" /> Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPickup(true)}
                      className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold border transition-all ${
                        isPickup ? 'border-copper-500 bg-copper-50 text-copper-700 shadow-sm' : 'border-neutral-200 bg-white text-neutral-600'
                      }`}
                    >
                      <ShieldCheck size={14} className="mr-1.5" /> Self Pickup
                    </button>
                  </div>
                </div>

                {!isPickup && (
                  <div>
                    <label htmlFor="delivery-zone" className="block text-xs font-semibold text-neutral-700">Delivery Zone</label>
                    <select
                      id="delivery-zone"
                      value={deliveryZoneId}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-800 focus:border-copper-400 focus:outline-none"
                    >
                      {NAIROBI_DELIVERY_ZONES.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} (+KSh {z.feeKes})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Fulfillment Groups:</span>
                    <span className="font-semibold text-heading">{sellerKeys.length}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Estimated Delivery Fee:</span>
                    <span className="font-semibold text-heading">
                      {isPickup ? 'Free Pickup' : `KSh ${deliveryFee.toLocaleString('en-KE')}`}
                    </span>
                  </div>
                  {hasMarketRefPrices && (
                    <div className="flex justify-between text-neutral-600 pt-1">
                      <span>Est. Market Ref Total:</span>
                      <span className="font-bold text-copper-700">
                        KSh {(totalMarketRef + deliveryFee).toLocaleString('en-KE')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-copper-100 bg-copper-50/50 p-3 text-[11px] leading-relaxed text-copper-800">
                  <p className="flex items-start gap-1.5">
                    <Info size={14} className="mt-0.5 shrink-0 text-copper-600" />
                    <span>
                      Prices shown are Kenyan market reference prices based on current research. Final item availability and price will be confirmed with the seller via WhatsApp.
                    </span>
                  </p>
                </div>

                <Link href="/checkout" className="block pt-2">
                  <Button size="lg" className="w-full h-12 text-base">
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
