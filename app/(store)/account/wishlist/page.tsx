'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useWishlistStore } from '@/stores/wishlistStore';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center shadow-card sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Heart size={32} strokeWidth={1.5} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-heading">Your Wishlist is Empty</h1>
          <p className="mt-2 text-xs text-neutral-500">
            Save your favorite electronics candidates to track market prices and updates.
          </p>
          <div className="mt-6">
            <Link href="/search">
              <Button size="lg" className="w-full">Explore Catalogue</Button>
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
          <Link href="/account" className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700">
            <ArrowLeft size={14} /> Back to Account
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-heading sm:text-3xl lg:text-4xl">
            My Wishlist ({items.length})
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearWishlist} className="self-start text-rose-600 hover:bg-rose-50 sm:self-auto">
          <Trash2 size={14} /> Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  );
}
