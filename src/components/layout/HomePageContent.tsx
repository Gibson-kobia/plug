'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv2,
  Watch,
  Headphones,
  Gamepad2,
  Camera,
  Wifi,
  HardDrive,
  Package,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NormalizedProduct, Category } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryGrid } from '@/components/layout/CategoryGrid';
import { Price } from '@/components/ui/price';
import { getOptimizedImageUrl } from '@/lib/utils';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
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

export interface HomePageContentProps {
  categories?: Category[] | undefined;
  featuredProducts?: NormalizedProduct[] | undefined;
  categoryProductsMap?: Record<string, NormalizedProduct[]> | undefined;
  categoryStats?: Record<string, { productCount: number; assetCount: number; brands: string[] }> | undefined;
}

const TRUST_PILLARS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp-First',
    desc: 'Direct merchant chat & orders on 0798021312',
    color: 'text-emerald-600 bg-emerald-500/10',
  },
  {
    icon: ShieldCheck,
    label: 'Verified Prices',
    desc: 'Kenyan retail market reference checks',
    color: 'text-blue-600 bg-blue-500/10',
  },
  {
    icon: Truck,
    label: 'Nairobi Same-Day',
    desc: 'Fast doorstep delivery & local pickups',
    color: 'text-copper-600 bg-copper-500/10',
  },
  {
    icon: Sparkles,
    label: 'Real Electronics',
    desc: 'Brand new, open-box & verified refurbished',
    color: 'text-amber-600 bg-amber-500/10',
  },
];

interface HeroProps {
  spotlightProduct?: NormalizedProduct | undefined;
}

function Hero({ spotlightProduct }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-copper-950/80" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,106,12,0.2),_transparent_55%)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3.5">
              <Link href="/category/smartphones">
                <Button size="default" className="w-full bg-copper-600 hover:bg-copper-500 sm:w-auto">
                  Browse Smartphones
                  <ArrowRight size={16} strokeWidth={2} className="ml-1.5" />
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="default"
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 sm:w-auto"
                >
                  Search All Products
                </Button>
              </Link>
            </div>

            {/* Trust Pill Group */}
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {TRUST_PILLARS.map(({ icon: Icon, label, color, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-xs"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${color}`}>
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{label}</p>
                    <p className="text-[10px] text-neutral-400 leading-tight line-clamp-2">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Spotlight Card */}
          <div className="lg:col-span-5">
            {spotlightProduct && (
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-neutral-900/90 p-3.5 shadow-xl backdrop-blur-md">
                  <Link href={`/product/${spotlightProduct.slug}`} className="group block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-950/80 p-3">
                      <img
                        src={getOptimizedImageUrl(spotlightProduct.primaryImageUrl, 480, 360)}
                        alt={spotlightProduct.displayName}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                          <CheckCircle2 size={11} strokeWidth={2.5} />
                          Spotlight Deal
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {spotlightProduct.brand && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-copper-400">
                          {spotlightProduct.brand}
                        </p>
                      )}
                      <h3 className="line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-copper-300">
                        {spotlightProduct.displayName}
                      </h3>

                      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                        <div>
                          {typeof spotlightProduct.priceKes === 'number' && spotlightProduct.priceKes > 0 ? (
                            <Price amount={spotlightProduct.priceKes} size="sm" className="text-white" />
                          ) : spotlightProduct.marketPriceStatus === 'VERIFIED' &&
                            typeof spotlightProduct.marketRefPriceKes === 'number' && spotlightProduct.marketRefPriceKes > 0 ? (
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                Verified Market Price
                              </span>
                              <Price amount={spotlightProduct.marketRefPriceKes} size="sm" className="text-white" />
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">Price on inquiry</span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-copper-400 group-hover:text-copper-300">
                          View Details <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CategorySectionProps {
  category: Category;
  products: NormalizedProduct[];
  productCount: number;
}

function CategorySection({ category, products, productCount }: CategorySectionProps) {
  const Icon = CATEGORY_ICON_MAP[category.id] || Package;

  return (
    <section aria-labelledby={`category-${category.id}-heading`} className="scroll-mt-6">
      {/* Category Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-copper-50 text-copper-700">
            <Icon size={18} strokeWidth={2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 id={`category-${category.id}-heading`} className="font-display text-lg font-bold text-neutral-900 sm:text-xl">
                {category.name}
              </h2>
              {productCount > 0 && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">
                  {productCount} items
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1">{category.description}</p>
          </div>
        </div>

        <Link
          href={`/category/${category.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 transition-colors hover:text-copper-700 sm:shrink-0"
        >
          View all {category.name} {productCount > 0 ? `(${productCount})` : ''} <ArrowRight size={13} strokeWidth={2} />
        </Link>
      </div>

      {/* Category Content: Products Grid OR Clean Empty State */}
      {products.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-3.5 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-neutral-400 shrink-0" />
            <span>Inventory coming soon — verified stock currently being listed for {category.name}.</span>
          </div>
          <Link
            href={`/category/${category.slug}`}
            className="font-semibold text-copper-600 hover:text-copper-700 shrink-0 ml-2"
          >
            Explore Category →
          </Link>
        </div>
      )}
    </section>
  );
}

export function HomePageContent({
  categories = [],
  featuredProducts = [],
  categoryProductsMap = {},
  categoryStats,
}: HomePageContentProps) {
  const spotlight = featuredProducts[0];

  return (
    <div id="main" className="flex min-h-screen flex-col bg-neutral-50/40">
      {/* 1. HERO */}
      <Hero spotlightProduct={spotlight} />

      {/* 2. COMPACT "SHOP BY CATEGORY" HORIZONTAL SLIDING RAIL (ALL CATEGORIES) */}
      <section className="border-y border-neutral-200/80 bg-white py-3 shadow-xs" aria-label="Electronics Categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Shop by Category</span>
              <span className="text-[10px] font-semibold text-neutral-400">({categories.length} Categories)</span>
            </div>
            <Link href="/search" className="text-[11px] font-semibold text-copper-600 hover:underline">
              All Catalogue →
            </Link>
          </div>
          <CategoryGrid variant="pills" showProductCount initialStats={categoryStats} />
        </div>
      </section>

      {/* 3. STOREFRONT CONTENT */}
      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* FEATURED ELECTRONICS (4-6 CURATED PRODUCTS) */}
        {featuredProducts.length > 0 && (
          <section aria-labelledby="featured-heading">
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-copper-600">Curated Deals</span>
                <h2 id="featured-heading" className="font-display text-lg font-bold text-neutral-900 sm:text-xl">
                  Featured Electronics in Kenya
                </h2>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 hover:text-copper-700"
              >
                View all featured <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 sm:gap-3.5">
              {featuredProducts.slice(0, 6).map((p, idx) => (
                <ProductCard key={p.productId} product={p} variant="compact" priority={idx < 3} />
              ))}
            </div>
          </section>
        )}

        {/* 4. PROGRESSIVE CATEGORY SECTIONS FOR ALL 13 AUTHORITATIVE CATEGORIES */}
        <div className="space-y-10">
          {categories.map(category => {
            const products = categoryProductsMap[category.id] || [];
            const count = categoryStats?.[category.id]?.productCount ?? 0;
            return (
              <CategorySection
                key={category.id}
                category={category}
                products={products}
                productCount={count}
              />
            );
          })}
        </div>

        {/* 5. BUYER ASSURANCE & WHATSAPP BANNER */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={13} /> Kenya Buyer Protection
              </span>
              <h3 className="mt-2.5 font-display text-xl font-bold text-neutral-900 sm:text-2xl">
                Verified Electronics. Order Directly on WhatsApp.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                Every listing connects to verified Kenyan merchant inventory. Inspect genuine product photos, confirm market pricing, and order securely via merchant concierge on <strong>0798021312</strong>.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/sellers">
                  <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800">
                    Sell on Marketplace
                  </Button>
                </Link>
                <a
                  href="https://wa.me/254798021312?text=Hello%20Kenya%20Electronics%20Marketplace,%20I%20have%20an%20inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                    <MessageCircle size={14} className="mr-1 text-emerald-600" />
                    WhatsApp Concierge (0798021312)
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 lg:col-span-5 text-xs">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <Smartphone className="h-5 w-5 text-copper-600" />
                <h4 className="mt-1.5 font-bold text-neutral-900">390+ Smartphones</h4>
                <p className="mt-0.5 text-[11px] text-neutral-500">Samsung, iPhone, Tecno, Xiaomi</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <Headphones className="h-5 w-5 text-copper-600" />
                <h4 className="mt-1.5 font-bold text-neutral-900">150+ Audio Gear</h4>
                <p className="mt-0.5 text-[11px] text-neutral-500">AirPods, Soundcore, JBL</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <Tv2 className="h-5 w-5 text-copper-600" />
                <h4 className="mt-1.5 font-bold text-neutral-900">140+ Smart TVs</h4>
                <p className="mt-0.5 text-[11px] text-neutral-500">Hisense, LG, Samsung, TCL</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <Laptop className="h-5 w-5 text-copper-600" />
                <h4 className="mt-1.5 font-bold text-neutral-900">390+ Laptops</h4>
                <p className="mt-0.5 text-[11px] text-neutral-500">HP, Dell, Lenovo, Apple</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRICE ALERTS & WISHLIST */}
        <section aria-labelledby="newsletter-heading">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-copper-200/80 bg-gradient-to-br from-copper-50/60 via-white to-neutral-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-copper-600">Price Alerts & Deals</span>
              <h3 id="newsletter-heading" className="mt-0.5 font-display text-lg font-bold text-neutral-900 sm:text-xl">
                Get notified on Kenyan electronics price drops
              </h3>
              <p className="mt-0.5 text-xs text-neutral-600">
                Receive instant alerts when verified seller prices drop for items in your wishlist.
              </p>
            </div>
            <div className="flex w-full max-w-sm gap-2">
              <input
                id="newsletter-email"
                type="text"
                placeholder="Phone (WhatsApp) or email"
                className="h-9 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-xs placeholder:text-neutral-400 focus:border-copper-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-300/50"
              />
              <Button size="sm" className="bg-copper-600 hover:bg-copper-500 text-white shrink-0">
                Notify Me
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
