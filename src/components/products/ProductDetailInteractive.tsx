'use client';

import * as React from 'react';
import {
  ShoppingCart,
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Smartphone,
  Cpu,
  BatteryCharging,
  Layers,
  Sparkles,
  Store,
  Phone,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import type { NormalizedProduct, EnrichedProductSpec, ProductVariant } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { enrichProductSpecification } from '@/lib/product-spec-engine';

interface ProductDetailInteractiveProps {
  product: NormalizedProduct;
}

export function ProductDetailInteractive({ product }: ProductDetailInteractiveProps) {
  const enriched: EnrichedProductSpec = React.useMemo(
    () => enrichProductSpecification(product),
    [product]
  );

  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(
    enriched.variants[0] || {
      sku: `SKU-${product.productId}`,
      variantName: 'Standard',
      priceKes: product.marketRefPriceKes || product.priceKes,
      stockCount: 1,
      condition: 'brand_new_sealed',
      isAvailable: true,
    }
  );

  const { addItem } = useCartStore();
  const [addedToCart, setAddedToCart] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'specs' | 'trust' | 'delivery'>('specs');
  const [showReserveModal, setShowReserveModal] = React.useState(false);
  const [reserveName, setReserveName] = React.useState('');
  const [reservePhone, setReservePhone] = React.useState('');
  const [reserveSubmitted, setReserveSubmitted] = React.useState(false);
  const [submittingLead, setSubmittingLead] = React.useState(false);

  // M-PESA quick buy states
  const [showMpesaModal, setShowMpesaModal] = React.useState(false);
  const [mpesaPhone, setMpesaPhone] = React.useState('');
  const [mpesaLoading, setMpesaLoading] = React.useState(false);
  const [mpesaMessage, setMpesaMessage] = React.useState<string | null>(null);
  const [mpesaSuccess, setMpesaSuccess] = React.useState(false);

  const currentPriceKes = selectedVariant.priceKes || enriched.commercial.kenyanRetailPriceKes || product.priceKes;

  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v);
  };

  const handleAddToCart = () => {
    const productWithVariant: NormalizedProduct = {
      ...product,
      displayName: `${product.displayName} (${selectedVariant.variantName})`,
      priceKes: currentPriceKes,
    };
    addItem(productWithVariant, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);

    // Track lead
    captureLead('buy_now_click');
  };

  const captureLead = async (source: string, customPhone?: string, customName?: string, notes?: string) => {
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.productId,
          productTitle: `${product.displayName} [${selectedVariant.variantName}]`,
          variantId: selectedVariant.sku,
          customerName: customName,
          customerPhone: customPhone,
          source,
          estimatedValueKes: currentPriceKes,
          notes,
        }),
      });
    } catch (e) {
      console.warn('[Lead Capture Error]:', e);
    }
  };

  const handleWhatsAppClick = () => {
    captureLead('whatsapp_pdp');
    const message = encodeURIComponent(
      `Hello Plug KE! I am inquiring about:\n\n*Product:* ${product.displayName}\n*Configuration:* ${selectedVariant.variantName}\n*Price:* ${
        currentPriceKes ? `KSh ${currentPriceKes.toLocaleString()}` : 'Price on Inquiry'
      }\n*SKU:* ${selectedVariant.sku}\n*Link:* ${typeof window !== 'undefined' ? window.location.href : ''}\n\nIs this available in shop for immediate dispatch/pickup?`
    );
    window.open(`https://wa.me/254700000000?text=${message}`, '_blank');
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservePhone) return;
    setSubmittingLead(true);
    await captureLead('reserve_click', reservePhone, reserveName, 'Customer requested in-store reservation hold');
    setSubmittingLead(false);
    setReserveSubmitted(true);
  };

  const handleMpesaStkTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaPhone || !currentPriceKes) return;
    setMpesaLoading(true);
    setMpesaMessage(null);

    try {
      const orderRef = `PLUG-DIR-${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderRef,
          phoneNumber: mpesaPhone,
          amountKes: currentPriceKes,
          accountReference: selectedVariant.sku.slice(0, 12),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMpesaSuccess(true);
        setMpesaMessage(data.customerMessage || 'Prompt sent to your phone. Enter M-PESA PIN to complete.');
        captureLead('buy_now_click', mpesaPhone, undefined, `Direct M-PESA STK initiated: ${data.checkoutRequestId}`);
      } else {
        setMpesaMessage(data.error || 'Failed to trigger M-PESA STK.');
      }
    } catch (err: any) {
      setMpesaMessage(err.message || 'Communication error.');
    } finally {
      setMpesaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Price Display */}
      <div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 shadow-sm">
        {typeof currentPriceKes === 'number' ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                Kenyan Retail Price
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                SKU: {selectedVariant.sku}
              </span>
            </div>
            <Price amount={currentPriceKes} size="lg" />
            {enriched.commercial.priceSource && (
              <p className="text-xs text-neutral-600">
                Market benchmark: <span className="font-semibold text-neutral-800">{enriched.commercial.priceSource}</span>
                {enriched.commercial.priceVerificationDate && ` (${enriched.commercial.priceVerificationDate})`}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <span className="font-display text-xl font-bold text-neutral-900 sm:text-2xl">
              Price Upon Inquiry
            </span>
            <p className="text-xs text-neutral-500">
              Verified Kenyan market price is updating. WhatsApp or reserve to lock in current stock price.
            </p>
          </div>
        )}
      </div>

      {/* Variant Selector (Storage / Color / RAM) */}
      {enriched.variants.length > 1 && (
        <div className="space-y-3 p-4 rounded-xl border border-neutral-200 bg-white">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">
            Select Configuration / Variant ({enriched.variants.length} options)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {enriched.variants.map((variant) => {
              const isSelected = selectedVariant.sku === variant.sku;
              return (
                <button
                  key={variant.sku}
                  type="button"
                  onClick={() => handleVariantSelect(variant)}
                  className={`text-left p-3 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-sm'
                      : 'border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{variant.variantName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="mt-1 text-xs text-neutral-600 font-mono">
                    {variant.priceKes ? `KSh ${variant.priceKes.toLocaleString()}` : 'Contact for Price'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trust & Guarantee Highlights */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>24h Inspection Guarantee</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700">
          <Truck className="w-4 h-4 text-copper-600 shrink-0" />
          <span>Same-Day Nairobi Dispatch</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Add to Cart */}
          <Button
            size="lg"
            variant="primary"
            className="flex-1 h-12 text-sm font-semibold"
            onClick={handleAddToCart}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1.5" /> Add to Cart
              </>
            )}
          </Button>

          {/* Pay via M-PESA STK Direct */}
          <Button
            size="lg"
            variant="primary"
            className="flex-1 h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowMpesaModal(true)}
          >
            <CreditCard className="w-4 h-4 mr-1.5" /> Pay with M-PESA
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* WhatsApp Direct Chat */}
          <Button
            size="default"
            variant="whatsapp"
            className="flex-1 h-11 text-xs font-semibold"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp Seller
          </Button>

          {/* Reserve In Shop */}
          <Button
            size="default"
            variant="outline"
            className="flex-1 h-11 text-xs font-semibold border-neutral-300 hover:bg-neutral-50"
            onClick={() => setShowReserveModal(true)}
          >
            <Store className="w-4 h-4 mr-1.5 text-neutral-600" /> Reserve In Shop
          </Button>
        </div>
      </div>

      {/* Tab Navigation: Specs, Trust & Provenance, Delivery */}
      <div className="border-t border-neutral-200 pt-6">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
              activeTab === 'specs'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('trust')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
              activeTab === 'trust'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Data Provenance & Trust
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
              activeTab === 'delivery'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Delivery & Warranty
          </button>
        </div>

        {/* Tab 1: Detailed Specifications */}
        {activeTab === 'specs' && (
          <div className="mt-4 space-y-4">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <dl className="divide-y divide-neutral-100 text-sm">
                {enriched.hardware.processor && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">Processor / SoC</dt>
                    <dd className="font-semibold text-neutral-900">{enriched.hardware.processor}</dd>
                  </div>
                )}
                {enriched.hardware.ramGb && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">RAM</dt>
                    <dd className="font-semibold text-neutral-900">
                      {enriched.hardware.ramGb} GB {enriched.hardware.ramType || ''}
                    </dd>
                  </div>
                )}
                {selectedVariant.storageGb || enriched.hardware.storageGb ? (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">Internal Storage</dt>
                    <dd className="font-semibold text-neutral-900">
                      {(selectedVariant.storageGb || enriched.hardware.storageGb)! >= 1024
                        ? `${(selectedVariant.storageGb || enriched.hardware.storageGb)! / 1024} TB`
                        : `${selectedVariant.storageGb || enriched.hardware.storageGb} GB`}{' '}
                      {enriched.hardware.storageType || ''}
                    </dd>
                  </div>
                ) : null}
                {enriched.hardware.batteryCapacityMah && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">Battery Capacity</dt>
                    <dd className="font-semibold text-neutral-900">
                      {enriched.hardware.batteryCapacityMah} mAh {enriched.hardware.chargingWattage ? `(${enriched.hardware.chargingWattage}W Fast Charge)` : ''}
                    </dd>
                  </div>
                )}
                {enriched.hardware.screenSizeInches && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">Display Size & Type</dt>
                    <dd className="font-semibold text-neutral-900">
                      {enriched.hardware.screenSizeInches}&quot; {enriched.hardware.panelType || ''} {enriched.hardware.refreshRateHz ? `(${enriched.hardware.refreshRateHz}Hz)` : ''}
                    </dd>
                  </div>
                )}
                {enriched.phoneDetails?.rearCameraSetup && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">Rear Camera</dt>
                    <dd className="font-semibold text-neutral-900 text-right">{enriched.phoneDetails.rearCameraSetup}</dd>
                  </div>
                )}
                {enriched.phoneDetails?.simConfiguration && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">SIM Configuration</dt>
                    <dd className="font-semibold text-neutral-900">{enriched.phoneDetails.simConfiguration}</dd>
                  </div>
                )}
                {enriched.hardware.operatingSystem && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <dt className="text-neutral-500">Operating System</dt>
                    <dd className="font-semibold text-neutral-900">{enriched.hardware.operatingSystem}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* Tab 2: Trust & Provenance */}
        {activeTab === 'trust' && (
          <div className="mt-4 p-4 rounded-xl border border-neutral-200 bg-white space-y-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900">Verification Source:</span>
              <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                {enriched.trust.source}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900">Data Confidence:</span>
              <Badge variant={enriched.trust.confidenceLevel === 'HIGH' ? 'verified' : 'low_stock'}>
                {enriched.trust.confidenceLevel} Confidence
              </Badge>
            </div>
            <p className="leading-relaxed">
              Every specification displayed for this product is verified against manufacturer documentation or verified Kenyan electronics distributors (e.g. PhonePlace Kenya, Official Brand Partners). We adhere to strict anti-theft and IMEI verification protocols before release.
            </p>
          </div>
        )}

        {/* Tab 3: Delivery & Warranty */}
        {activeTab === 'delivery' && (
          <div className="mt-4 p-4 rounded-xl border border-neutral-200 bg-white space-y-3 text-xs text-neutral-700">
            <div className="space-y-1">
              <p className="font-bold text-neutral-900">Nairobi Metropolis (Same-Day / 3-Hour)</p>
              <p className="text-neutral-600">Direct courier or rider dispatch across CBD, Westlands, Kilimani, Karen, Eastlands, Thika Road.</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-neutral-900">Upcountry Kenya (24-Hour G4S / Fargo)</p>
              <p className="text-neutral-600">Insured door-to-door or parcel office collection across Mombasa, Kisumu, Nakuru, Eldoret, Nyeri, etc.</p>
            </div>
            <div className="pt-2 border-t border-neutral-100">
              <span className="font-bold text-neutral-900">Warranty:</span> {enriched.commercial.warrantyDurationMonths || 12} Months ({enriched.commercial.warrantyType || 'Merchant Shop Warranty'})
            </div>
          </div>
        )}
      </div>

      {/* Reserve In Shop Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-neutral-900">Reserve in Shop</h3>
              <button onClick={() => setShowReserveModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reserveSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="font-bold text-neutral-900 text-base">Reservation Request Received</p>
                <p className="text-xs text-neutral-600">
                  Our shop team has placed a hold on this item for you. We will call you shortly on{' '}
                  <span className="font-semibold text-neutral-800">{reservePhone}</span>.
                </p>
                <Button className="mt-4 w-full" onClick={() => setShowReserveModal(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReserveSubmit} className="space-y-3">
                <p className="text-xs text-neutral-600">
                  We will hold <strong>{product.displayName}</strong> for 24 hours at the shop. No advance payment required for in-store pickup.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kelvin Mwangi"
                    value={reserveName}
                    onChange={(e) => setReserveName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number (M-PESA / Call)</label>
                  <input
                    type="tel"
                    required
                    placeholder="07XXXXXXXX or 01XXXXXXXX"
                    value={reservePhone}
                    onChange={(e) => setReservePhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <Button type="submit" disabled={submittingLead} className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs">
                  {submittingLead ? 'Reserving...' : 'Confirm Shop Hold'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Direct M-PESA STK Push Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Pay with Lipa Na M-PESA
              </h3>
              <button onClick={() => setShowMpesaModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>KSh {currentPriceKes?.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Item: {product.displayName} ({selectedVariant.variantName})
              </p>
            </div>

            {mpesaMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  mpesaSuccess
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {mpesaSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{mpesaMessage}</span>
              </div>
            )}

            {!mpesaSuccess && (
              <form onSubmit={handleMpesaStkTrigger} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">M-PESA Registered Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="07XXXXXXXX or 01XXXXXXXX"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    You will receive an instant PIN prompt on this phone.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={mpesaLoading || !currentPriceKes}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                >
                  {mpesaLoading ? 'Sending STK Prompt...' : `Send STK Prompt (KSh ${currentPriceKes?.toLocaleString()})`}
                </Button>
              </form>
            )}

            {mpesaSuccess && (
              <Button className="w-full" onClick={() => setShowMpesaModal(false)}>
                Done
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
