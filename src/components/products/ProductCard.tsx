'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon, Heart } from 'lucide-react';

import type { NormalizedProduct } from '@/types';
import { cn, getOptimizedImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import { Skeleton, SkeletonImage, SkeletonText, SkeletonPrice } from '@/components/ui/skeleton';
import { useWishlistStore } from '@/stores/wishlistStore';

export interface ProductCardProps {
  product: NormalizedProduct;
  variant?: 'default' | 'compact' | 'featured';
  priority?: boolean;
  className?: string;
}

function cleanDisplayTitle(rawName: string, brand: string | null): string {
  if (!rawName) return 'Electronics Item';
  let t = rawName
    .replace(/\s+(medium|original|preview|thumb|thumbnail)$/i, '')
    .replace(/@\d+x$/i, '')
    .replace(/[_\-]+/g, ' ')
    .trim();

  // Prefix brand if not already present
  if (brand && !t.toLowerCase().startsWith(brand.toLowerCase())) {
    t = `${brand} ${t}`;
  }
  return t;
}

export function ProductCard({ product, variant = 'default', priority = false, className }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const inWishlist = isInWishlist(product.productId);

  const displayBrand = product.brand;
  const fullTitle = cleanDisplayTitle(product.displayName, displayBrand);
  const isCompact = variant === 'compact';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-white border border-neutral-200/80 shadow-xs transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-copper-300 hover:ring-1 hover:ring-copper-200/50',
        className
      )}
    >
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-neutral-50 p-3">
        {product.primaryImageUrl ? (
          <img
            src={getOptimizedImageUrl(product.primaryImageUrl, 300, 300)}
            alt={fullTitle}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-neutral-100 text-neutral-400">
            <ImageIcon size={18} strokeWidth={1.5} />
            <span className="text-[10px]">No image</span>
          </div>
        )}

        {/* Condition Tag */}
        {product.condition && product.condition !== 'new' && (
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <Badge
              variant={product.condition === 'refurbished' ? 'verified' : 'used'}
              className="text-[10px] px-1.5 py-0 shadow-xs"
            >
              {product.condition === 'refurbished' ? 'Refurbished' : 'Verified Used'}
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-xs backdrop-blur-xs transition-all',
            'hover:bg-white hover:text-copper-600 hover:scale-110 focus:outline-none',
            inWishlist && 'text-rose-500 hover:text-rose-600 bg-white'
          )}
        >
          <Heart size={14} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} strokeWidth={2} />
        </button>
      </Link>

      {/* Content */}
      <div className={cn('flex flex-1 flex-col justify-between gap-2 p-3', isCompact && 'p-2.5')}>
        <div className="space-y-0.5">
          {displayBrand && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-copper-600">
              {displayBrand}
            </p>
          )}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-copper-700 sm:text-[13px]">
              {fullTitle}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto border-t border-neutral-100 pt-2 flex items-end justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            {typeof product.priceKes === 'number' && product.priceKes > 0 ? (
              <Price amount={product.priceKes} size="sm" />
            ) : product.marketPriceStatus === 'VERIFIED' && typeof product.marketRefPriceKes === 'number' && product.marketRefPriceKes > 0 ? (
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-700">Market Price</span>
                <Price amount={product.marketRefPriceKes} size="sm" />
              </div>
            ) : (
              <span className="text-[11px] font-medium text-neutral-400">Price unavailable</span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-copper-600 group-hover:text-white"
            aria-label={`View ${fullTitle}`}
          >
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  const aspectRatio = variant === 'featured' ? 'aspect-[4/3]' : 'aspect-square';
  return (
    <div className={cn(
      'flex flex-col overflow-hidden rounded-2xl bg-white shadow-card',
      variant === 'compact' && 'rounded-xl',
      variant === 'featured' && 'rounded-3xl'
    )}>
      <div className={cn('w-full bg-zinc-50', aspectRatio)}>
        <SkeletonImage className="h-full w-full rounded-none" />
      </div>
      <div className={cn('flex flex-1 flex-col gap-2', variant === 'compact' ? 'p-2.5' : 'p-3.5')}>
        <Skeleton className="h-3 w-14 rounded-full" />
        <SkeletonText lines={2} />
        <Skeleton className="h-3 w-24" />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <SkeletonPrice />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
