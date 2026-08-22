'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Smartphone, Tablet, Laptop, Monitor, Tv2, Watch,
  Headphones, Gamepad2, Camera, Wifi, HardDrive, Package,
  ChevronRight,
} from 'lucide-react';

import type { Category } from '@/types';
import { CATEGORIES, CATEGORY_ICON_COLORS, CATEGORY_DEFAULT_COLOR } from '@/lib/catalogue';
import { getCategoryStats } from '@/lib/product-data';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  C01: Smartphone,
  C02: Tablet,
  C03: Laptop,
  C04: Monitor,
  C05: Monitor,
  C06: Tv2,
  C07: Watch,
  C08: Headphones,
  C09: Gamepad2,
  C10: Camera,
  C11: Wifi,
  C12: HardDrive,
  C13: Package,
};

export interface CategoryGridProps {
  showProductCount?: boolean | undefined;
  variant?: 'home' | 'sidebar' | 'compact' | 'pills' | 'nav' | undefined;
  className?: string | undefined;
  limit?: number | undefined;
  onlyWithProducts?: boolean | undefined;
  initialStats?: Record<string, { productCount: number; assetCount: number; brands: string[] }> | undefined;
}

export function CategoryGrid({
  showProductCount = true,
  variant = 'home',
  className,
  limit,
  onlyWithProducts = false,
  initialStats,
}: CategoryGridProps) {
  const [stats, setStats] = React.useState<Record<string, { productCount: number; assetCount: number; brands: string[] }> | null>(initialStats || null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (stats || typeof window === 'undefined') return;
    fetch('/api/catalogue/stats', { cache: 'force-cache' })
      .then(r => r.ok ? r.json() : Promise.resolve(null))
      .then(data => setStats(data))
      .catch(() => setStats(null));
  }, [stats]);

  let cats: Category[] = [...CATEGORIES];
  if (onlyWithProducts && stats) {
    cats = cats.filter(c => (stats[c.id]?.productCount ?? 0) > 0);
  }
  if (limit) cats = cats.slice(0, limit);

  if (variant === 'pills' || variant === 'nav') {
    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const amount = direction === 'left' ? -280 : 280;
        scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      }
    };

    return (
      <div className={cn('relative group/rail', className)}>
        {/* Left Scroll Button (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
          className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-600 shadow-sm backdrop-blur-xs transition-all hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none md:flex opacity-0 group-hover/rail:opacity-100 disabled:opacity-0"
        >
          <ChevronRight size={16} strokeWidth={2.5} className="rotate-180" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none sm:gap-2.5 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
          role="list"
          aria-label="Categories rail"
        >
          {cats.map(cat => {
            const Icon = ICON_MAP[cat.id] || Package;
            const productCount = stats?.[cat.id]?.productCount ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                role="listitem"
                className="group flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-xs transition-all hover:border-copper-300 hover:bg-copper-50/40 hover:text-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40"
                style={{ scrollSnapAlign: 'start' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-copper-100 group-hover:text-copper-700">
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span className="whitespace-nowrap">{cat.name}</span>
                {showProductCount && productCount > 0 && (
                  <span className="rounded-full bg-neutral-100 px-1.5 py-0.2 text-[10px] font-bold text-neutral-500 group-hover:bg-copper-200/60 group-hover:text-copper-800">
                    {productCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Button (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
          className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-600 shadow-sm backdrop-blur-xs transition-all hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none md:flex opacity-0 group-hover/rail:opacity-100"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {cats.map(cat => {
          const Icon = ICON_MAP[cat.id] || Package;
          const productCount = stats?.[cat.id]?.productCount ?? 0;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-copper-300 hover:bg-copper-50 hover:text-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40"
            >
              <Icon size={14} strokeWidth={1.75} />
              <span>{cat.name}</span>
              {showProductCount && productCount > 0 && (
                <span className="rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold text-neutral-500 group-hover:bg-white/30">
                  {productCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <nav className={cn('flex flex-col gap-0.5', className)} aria-label="Product categories">
        {cats.map(cat => {
          const Icon = ICON_MAP[cat.id] || Package;
          const productCount = stats?.[cat.id]?.productCount ?? 0;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-copper-50 hover:text-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40"
            >
              <span className="flex items-center gap-2.5">
                <Icon size={18} strokeWidth={1.75} className="text-copper-600 group-hover:text-copper-600" />
                <span className="font-medium">{cat.name}</span>
              </span>
              {showProductCount && productCount > 0 && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500 group-hover:bg-copper-100 group-hover:text-copper-700">
                  {productCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5',
      className
    )} role="list" aria-label="Browse by category">
      {cats.map((cat, idx) => {
        const Icon = ICON_MAP[cat.id] || Package;
        const gradient = CATEGORY_ICON_COLORS[cat.id] || CATEGORY_DEFAULT_COLOR;
        const productCount = stats?.[cat.id]?.productCount ?? 0;
        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            role="listitem"
            className="group relative flex flex-col items-start gap-2.5 overflow-hidden rounded-2xl bg-white p-4 shadow-card transition-all duration-200 ease-out-quint hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/40 focus-visible:ring-offset-2 sm:p-5"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14',
              gradient
            )}>
              <Icon size={24} strokeWidth={1.75} className="sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-heading sm:text-base">
                {cat.name}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 sm:text-[13px]">
                {cat.description}
              </p>
            </div>
            <div className="flex w-full items-center justify-between text-xs">
              {showProductCount && productCount > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-copper-600">
                  {productCount} items
                </span>
              ) : (
                <span className="font-medium text-neutral-400">Coming soon</span>
              )}
              <ChevronRight
                size={16}
                strokeWidth={2}
                className="text-neutral-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-copper-600"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
