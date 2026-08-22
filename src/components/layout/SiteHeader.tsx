'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Package } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from './CategoryGrid';

export function SiteHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') ?? '';
  const [query, setQuery] = React.useState(initialQuery);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-b-neutral-200 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40 rounded-lg p-1 -m-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-copper-500 to-copper-700 text-white shadow-md sm:h-10 sm:w-10">
            <Package size={20} strokeWidth={1.75} />
          </span>
          <span className="hidden sm:block">
            <span className="block font-display text-lg font-bold leading-tight tracking-tight text-navy-900">
              Kenya
            </span>
            <span className="-mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-copper-600">
              Electronics
            </span>
          </span>
          <span className="sm:hidden font-display text-base font-bold text-navy-900">
            KE<span className="text-copper-600">Electronics</span>
          </span>
        </Link>

        <form onSubmit={onSubmit} className="relative ml-auto flex min-w-0 flex-1 max-w-xl items-center sm:ml-6">
          <div className="relative w-full">
            <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              type="search"
              placeholder="Search phones, TVs, earbuds…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-10 pr-20 text-sm sm:h-12 sm:text-base"
              aria-label="Search products"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 px-4 text-xs sm:h-10 sm:text-sm"
            >
              Search
            </Button>
          </div>
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} strokeWidth={1.75} />
          </Link>
          <Link
            href="/account"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40"
            aria-label="Account"
          >
            <User size={20} strokeWidth={1.75} />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMobileNavOpen(o => !o)}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
        </button>
      </div>

      {mobileNavOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Link
                href="/cart"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                onClick={() => setMobileNavOpen(false)}
              >
                <ShoppingCart size={18} /> Cart
              </Link>
              <Link
                href="/account"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                onClick={() => setMobileNavOpen(false)}
              >
                <User size={18} /> Account
              </Link>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Categories</p>
              <CategoryGrid
                variant="sidebar"
                onlyWithProducts
                showProductCount
                className="[&_a]:py-1.5"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
