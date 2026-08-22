'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Scale, Trash2, ArrowLeft, Plus, Check, X,
  ShoppingBag, ShieldCheck, ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Price } from '@/components/ui/price';
import { Badge } from '@/components/ui/badge';
import { useCompareStore } from '@/stores/compareStore';
import { useCartStore } from '@/stores/cartStore';

export default function ComparePage() {
  const { items, removeItem, clearCompare } = useCompareStore();
  const { addItem: addToCart } = useCartStore();

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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-copper-50 text-copper-600">
            <Scale size={32} strokeWidth={1.5} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-heading">No Products Selected</h1>
          <p className="mt-2 text-xs text-neutral-500">
            Select up to 4 devices to compare specs, RAM, storage, battery capacity, and market reference prices side by side.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/search">
              <Button size="lg" className="w-full">
                Browse Products to Compare
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract common specification keys across items
  const allSpecKeys = Array.from(
    new Set(
      items.flatMap((p) => (p.specs ? Object.keys(p.specs) : []))
    )
  );

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/search" className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700">
            <ArrowLeft size={14} /> Back to Search
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-heading sm:text-3xl lg:text-4xl">
            Product Comparison ({items.length} of 4)
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCompare} className="self-start text-rose-600 hover:bg-rose-50 sm:self-auto">
          <Trash2 size={14} /> Clear Comparison
        </Button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-neutral-100 bg-white shadow-card">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/70">
              <th className="w-48 p-4 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                Product Features
              </th>
              {items.map((product) => (
                <th key={product.productId} className="p-4 align-top w-64 border-l border-neutral-100">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-copper-600">
                        {product.brand || 'Brand TBC'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(product.productId)}
                        className="rounded-lg p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Remove from comparison"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="h-32 w-full overflow-hidden rounded-2xl bg-zinc-50 border border-neutral-100">
                      <img
                        src={product.primaryImageUrl}
                        alt={product.displayName}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                      />
                    </div>

                    <Link href={`/product/${product.slug}`} className="font-bold text-heading text-sm hover:text-copper-600 line-clamp-2">
                      {product.displayName}
                    </Link>

                    <div className="mt-1">
                      {product.marketPriceStatus === 'VERIFIED' && typeof product.marketRefPriceKes === 'number' ? (
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-copper-600">Market Ref</span>
                          <Price amount={product.marketRefPriceKes} size="sm" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Price not verified</span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="mt-2 w-full"
                    >
                      <ShoppingBag size={14} className="mr-1.5" /> Add to Cart
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            <tr>
              <td className="p-4 font-semibold text-neutral-700 bg-neutral-50/40">Category</td>
              {items.map((product) => (
                <td key={product.productId} className="p-4 border-l border-neutral-100 text-neutral-800">
                  {product.categoryName || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-neutral-700 bg-neutral-50/40">Subcategory</td>
              {items.map((product) => (
                <td key={product.productId} className="p-4 border-l border-neutral-100 text-neutral-800">
                  {product.subcategoryName || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-neutral-700 bg-neutral-50/40">Model</td>
              {items.map((product) => (
                <td key={product.productId} className="p-4 border-l border-neutral-100 font-mono text-xs">
                  {product.model || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-neutral-700 bg-neutral-50/40">Confidence Rating</td>
              {items.map((product) => (
                <td key={product.productId} className="p-4 border-l border-neutral-100">
                  <Badge variant={product.confidence === 'HIGH' ? 'verified' : 'secondary'}>
                    {product.confidence}
                  </Badge>
                </td>
              ))}
            </tr>

            {allSpecKeys.map((specKey) => (
              <tr key={specKey}>
                <td className="p-4 font-semibold capitalize text-neutral-700 bg-neutral-50/40">
                  {specKey.replace(/_/g, ' ')}
                </td>
                {items.map((product) => {
                  const val = product.specs?.[specKey];
                  return (
                    <td key={product.productId} className="p-4 border-l border-neutral-100 text-neutral-800">
                      {val !== undefined && val !== null ? String(val) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
