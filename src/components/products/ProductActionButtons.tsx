'use client';

import * as React from 'react';
import { ShoppingCart, MessageCircle, Heart, Share2, Check, Shield, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NormalizedProduct } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { buildProductInquiryWhatsAppUrl } from '@/lib/checkout/order';

interface ProductActionButtonsProps {
  product: NormalizedProduct;
}

export function ProductActionButtons({ product }: ProductActionButtonsProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [inWishlist, setInWishlist] = React.useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: product.displayName,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        // user cancelled or share failed
      }
    }
  };

  const handleWishlist = () => {
    setInWishlist(!inWishlist);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const whatsappInquiryUrl = buildProductInquiryWhatsAppUrl(product, currentUrl);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          variant="primary"
          className="flex-1 h-14 text-base sm:h-12"
          onClick={handleAddToCart}
          disabled={typeof product.stockCount === 'number' && product.stockCount <= 0}
        >
          {added ? (
            <>
              <Check size={18} strokeWidth={2} className="text-white" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={18} strokeWidth={1.75} />
              {typeof product.priceKes === 'number' || (product.marketPriceStatus === 'VERIFIED' && typeof product.marketRefPriceKes === 'number')
                ? 'Add to Cart'
                : 'Reserve / Inquire'}
            </>
          )}
        </Button>

        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            size="lg"
            variant="whatsapp"
            className="w-full h-14 text-base sm:h-12"
          >
            <MessageCircle size={18} strokeWidth={1.75} />
            WhatsApp Seller
          </Button>
        </a>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="default"
          variant="outline"
          className={`flex-1 h-12 ${inWishlist ? 'text-copper-600 border-copper-300 bg-copper-50' : ''}`}
          onClick={handleWishlist}
        >
          <Heart size={16} strokeWidth={1.75} className={inWishlist ? 'fill-copper-600 text-copper-600' : ''} />
          {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </Button>

        <Button
          size="default"
          variant="outline"
          className="flex-1 h-12"
          onClick={handleShare}
        >
          {copied ? (
            <>
              <Check size={16} strokeWidth={2} className="text-jade-600" />
              Link Copied!
            </>
          ) : (
            <>
              <Share2 size={16} strokeWidth={1.75} />
              Share Product
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-card sm:gap-4">
        <div className="flex flex-col items-start gap-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-jade-500/10 text-jade-700">
            <MessageCircle size={15} strokeWidth={1.75} />
          </span>
          <p className="text-xs font-semibold text-heading">Direct Inquiry</p>
          <p className="text-[11px] text-neutral-500">WhatsApp support</p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-copper-500/10 text-copper-700">
            <Truck size={15} strokeWidth={1.75} />
          </span>
          <p className="text-xs font-semibold text-heading">Nairobi Delivery</p>
          <p className="text-[11px] text-neutral-500">8 local zones</p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700/10 text-navy-800">
            <Package size={15} strokeWidth={1.75} />
          </span>
          <p className="text-xs font-semibold text-heading">Nationwide</p>
          <p className="text-[11px] text-neutral-500">47 counties</p>
        </div>
      </div>
    </div>
  );
}
