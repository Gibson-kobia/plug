import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Filter, ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  CATEGORY_ICON_COLORS,
  CATEGORY_DEFAULT_COLOR,
  CATEGORIES,
} from '@/lib/catalogue';
import { searchProducts } from '@/lib/product-data';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryGrid } from '@/components/layout/CategoryGrid';
import { SortSelect } from '@/components/products/SortSelect';

interface SubCatPageProps {
  params: { slug: string; subslug: string };
  searchParams?: Record<string, string | undefined>;
}

export function generateStaticParams() {
  const out: Array<{ slug: string; subslug: string }> = [];
  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      out.push({ slug: cat.slug, subslug: sub.slug });
    }
  }
  return out;
}

export function generateMetadata({ params }: SubCatPageProps): Metadata {
  const cat = getCategoryBySlug(params.slug);
  const sub = getSubcategoryBySlug(params.subslug);
  if (!cat || !sub) return { title: 'Subcategory Not Found' };
  return {
    title: `${sub.name} | ${cat.name}`,
    description: `Shop ${sub.name} in Kenya under our ${cat.name} category. Verified sellers, WhatsApp-first checkout.`,
  };
}

export default function SubcategoryListingPage({ params, searchParams }: SubCatPageProps) {
  const cat = getCategoryBySlug(params.slug);
  const sub = getSubcategoryBySlug(params.subslug);
  if (!cat || !sub || sub.categoryId !== cat.id) notFound();

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 24;
  const sort = (searchParams?.sort as any) || 'relevance';

  const result = searchProducts({
    categoryId: cat.id,
    subcategoryId: sub.id,
    page,
    pageSize,
    sortBy: sort,
  });

  const totalPages = Math.max(1, result.totalPages);
  const gradient = CATEGORY_ICON_COLORS[cat.id] || CATEGORY_DEFAULT_COLOR;

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
        <Link href="/" className="flex items-center gap-1 hover:text-copper-600">
          <Home size={14} strokeWidth={1.75} /> Home
        </Link>
        <ChevronRight size={14} strokeWidth={2} className="text-neutral-300" />
        <Link href={`/category/${cat.slug}`} className="hover:text-copper-600">
          {cat.name}
        </Link>
        <ChevronRight size={14} strokeWidth={2} className="text-neutral-300" />
        <span className="font-medium text-neutral-800">{sub.name}</span>
      </nav>

      <section className="mb-7 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-neutral-100">
        <div className={`bg-gradient-to-r ${gradient} px-5 py-6 sm:px-8 sm:py-8`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Browse {cat.name}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {sub.name}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-white/80 sm:text-[15px]">
                {sub.name} — part of our {cat.name} category.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="warranty" className="bg-white/15 text-white hover:bg-white/20">
                  {result.totalCount.toLocaleString('en-KE')} items
                </Badge>
                {result.availableBrands.slice(0, 5).map(b => (
                  <Badge key={b} variant="warranty" className="bg-white/10 text-white/90 hover:bg-white/20">
                    {b}
                  </Badge>
                ))}
                {result.availableBrands.length > 5 && (
                  <span className="text-xs font-semibold text-white/70">+{result.availableBrands.length - 5} more</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link href={`/search?categoryId=${cat.id}&subcategoryId=${sub.id}`}>
                <Button variant="outline" size="default" className="h-11 border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20">
                  <Filter size={16} strokeWidth={1.75} /> Filters
                </Button>
              </Link>
              <Link href="/search">
                <Button size="default" className="h-11 bg-white text-navy-900 hover:bg-white/90">
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-5 py-4 sm:px-8">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Subcategories:
          </span>
          <Link
            href={`/category/${cat.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-copper-300 hover:bg-copper-50 hover:text-copper-700"
          >
            All
          </Link>
          {cat.subcategories.map(s => (
            <Link
              key={s.id}
              href={`/category/${cat.slug}/${s.slug}`}
              className={
                s.id === sub.id
                  ? 'inline-flex items-center gap-1 rounded-full border border-copper-400 bg-copper-50 px-3 py-1.5 text-xs font-semibold text-copper-700'
                  : 'inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-copper-300 hover:bg-copper-50 hover:text-copper-700'
              }
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Sidebar">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
              <h3 className="mb-3 text-sm font-semibold text-heading">All Categories</h3>
              <CategoryGrid variant="sidebar" onlyWithProducts showProductCount />
            </div>
            {result.availableBrands.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
                <h3 className="mb-3 text-sm font-semibold text-heading">Brands</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.availableBrands.slice(0, 20).map(b => (
                    <Link
                      key={b}
                      href={`/search?categoryId=${cat.id}&subcategoryId=${sub.id}&brands=${encodeURIComponent(b)}`}
                      className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:border-copper-300 hover:bg-copper-50 hover:text-copper-700"
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0 lg:col-span-9" aria-label="Product results">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-neutral-100 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm text-neutral-600">
              Showing <span className="font-semibold text-heading">{result.products.length}</span>{' '}
              of <span className="font-semibold text-heading">{result.totalCount.toLocaleString('en-KE')}</span>{' '}
              items · Page {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-10 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs text-neutral-500 sm:text-sm">
                <ArrowUpDown size={14} strokeWidth={2} />
                Sorted by{' '}
                <SortSelect current={sort} />
              </div>
            </div>
          </div>

          {result.products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:gap-5">
              {result.products.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center">
              <p className="font-semibold text-heading">No products available yet</p>
              <p className="mt-1 text-sm text-neutral-500">
                ImageKit catalogue has no products mapped to this subcategory yet. Check back soon.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href={`/category/${cat.slug}`}><Button variant="outline">All {cat.name}</Button></Link>
                <Link href="/"><Button>Back to Home</Button></Link>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <Link href={buildPaginationUrl(params, searchParams, page - 1, sort)}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
                const pageN = computePageNumber(i, page, totalPages);
                const active = pageN === page;
                return (
                  <Link
                    key={pageN}
                    href={buildPaginationUrl(params, searchParams, pageN, sort)}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'border border-neutral-200 bg-white text-neutral-700 hover:border-copper-300 hover:bg-copper-50 hover:text-copper-700'
                    }`}
                  >
                    {pageN}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link href={buildPaginationUrl(params, searchParams, page + 1, sort)}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function buildPaginationUrl(
  params: { slug: string; subslug: string },
  searchParams: Record<string, string | undefined> | undefined,
  page: number,
  sort: string,
): string {
  const qs = new URLSearchParams();
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== 'page') qs.set(k, v);
    }
  }
  if (page > 1) qs.set('page', String(page));
  if (sort !== 'relevance') qs.set('sort', sort);
  const base = `/category/${params.slug}/${params.subslug}`;
  const str = qs.toString();
  return str ? `${base}?${str}` : base;
}

function computePageNumber(i: number, page: number, totalPages: number): number {
  if (totalPages <= 7) return i + 1;
  const half = 3;
  const pivot = Math.max(half + 1, Math.min(totalPages - half, page));
  return pivot - half + i;
}
