import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Home, ChevronRight, Search as SearchIcon, Filter, X,
  ArrowUpDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { searchProducts, getDistinctBrands } from '@/lib/product-data';
import type { SearchFilters } from '@/types';
import {
  CATEGORIES, getCategoryById, getSubcategoryById,
} from '@/lib/catalogue';
import { ProductCard } from '@/components/products/ProductCard';

export const metadata: Metadata = {
  title: 'Search Products — Kenya Electronics Marketplace',
  description:
    'Search thousands of real electronics products across 13 categories. Filter by brand, price, category and condition.',
};

interface SearchPageProps {
  searchParams?: Record<string, string | undefined>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams?.q || '';
  const categoryId = searchParams?.categoryId || undefined;
  const subcategoryId = searchParams?.subcategoryId || undefined;
  const brands = (searchParams?.brands || '').split(',').filter(Boolean);
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 24;
  const sort = (searchParams?.sort as any) || 'relevance';

  const filters: SearchFilters = {};
  if (q) filters.searchQuery = q;
  if (categoryId) filters.categoryId = categoryId;
  if (subcategoryId) filters.subcategoryId = subcategoryId;
  if (brands.length) filters.brands = brands;
  filters.page = page;
  filters.pageSize = pageSize;
  filters.sortBy = sort;

  const result = searchProducts(filters);

  const cat = categoryId ? getCategoryById(categoryId) : undefined;
  const sub = subcategoryId ? getSubcategoryById(subcategoryId) : undefined;
  const totalPages = Math.max(1, result.totalPages);
  const allBrandsForFilters = categoryId ? getDistinctBrands(categoryId) : getDistinctBrands();

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
        <Link href="/" className="flex items-center gap-1 hover:text-copper-600">
          <Home size={14} strokeWidth={1.75} /> Home
        </Link>
        <ChevronRight size={14} strokeWidth={2} className="text-neutral-300" />
        <span className="font-medium text-neutral-800">Search</span>
        {q && (
          <>
            <ChevronRight size={14} strokeWidth={2} className="text-neutral-300" />
            <span className="text-neutral-600">“{q}”</span>
          </>
        )}
      </nav>

      <section className="mb-7 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-neutral-100">
        <div className="bg-gradient-to-br from-navy-900 via-navy-700 to-copper-900/60 px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-300">
            {q ? `Results for “${q}”` : 'Browse the ImageKit Catalogue'}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {q ? `${result.totalCount.toLocaleString('en-KE')} matches` : 'Find your next device'}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-white/80 sm:text-[15px]">
            {q ? 'All results are real products from the ImageKit asset library.' : '13 categories · 1,219 normalized products · 6,430 CDN-hosted images.'}
          </p>
          <form
            className="mt-6"
            onSubmit={(e) => { e.preventDefault(); }}
            action="/search"
            method="get"
          >
            <div className="relative max-w-2xl">
              <SearchIcon size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <Input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search by product name, brand or model…"
                className="h-14 rounded-2xl border-white/15 bg-white/10 pl-12 pr-32 text-base placeholder:text-white/50 text-white focus:border-copper-400/60 focus:bg-white/15 focus-visible:ring-copper-400/40"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 px-6 text-sm sm:h-12 sm:text-base"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
          <div className="sticky top-24 space-y-6">
            <FilterPanel
              selectedCategoryId={categoryId}
              selectedSubcategoryId={subcategoryId}
              selectedBrands={brands}
              allBrands={allBrandsForFilters}
              q={q}
              sort={sort}
            />
          </div>
        </aside>

        <section className="min-w-0 lg:col-span-9" aria-label="Search results">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-neutral-100 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-neutral-600">
                Showing <span className="font-semibold text-heading">{result.products.length}</span>{' '}
                of <span className="font-semibold text-heading">{result.totalCount.toLocaleString('en-KE')}</span>{' '}
                items · Page {page} / {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs text-neutral-500 sm:text-sm">
                <ArrowUpDown size={14} strokeWidth={2} />
                Sorted by{' '}
                <SortSelect current={sort} />
              </div>
            </div>
          </div>

          <ActiveFilterChips
            q={q}
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            brands={brands}
            sort={sort}
          />

          {result.products.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:gap-5">
              {result.products.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center">
              <p className="font-semibold text-heading">No products matched your filters</p>
              <p className="mt-1 text-sm text-neutral-500">
                Try removing a brand filter or searching a different keyword.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/search"><Button variant="outline">Clear filters</Button></Link>
                <Link href="/"><Button>Back to Home</Button></Link>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <Link href={buildSearchUrl(searchParams, page - 1, sort)}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
                const pageN = computePageNumber(i, page, totalPages);
                const active = pageN === page;
                return (
                  <Link
                    key={pageN}
                    href={buildSearchUrl(searchParams, pageN, sort)}
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
                <Link href={buildSearchUrl(searchParams, page + 1, sort)}>
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

function SortSelect({ current }: { current: string }) {
  return (
    <select
      aria-label="Sort products"
      className="bg-transparent pr-1 text-sm font-semibold text-heading focus:outline-none"
      defaultValue={current}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        const u = new URL(window.location.href);
        u.searchParams.set('sort', e.target.value);
        u.searchParams.delete('page');
        window.location.assign(u.href);
      }}
    >
      <option value="relevance">Relevance</option>
      <option value="name-asc">Name A-Z</option>
      <option value="newest">Newest first</option>
    </select>
  );
}

interface FilterPanelProps {
  selectedCategoryId?: string | undefined;
  selectedSubcategoryId?: string | undefined;
  selectedBrands: string[];
  allBrands: string[];
  q: string;
  sort: string;
}

function FilterPanel({ selectedCategoryId, selectedBrands, allBrands }: FilterPanelProps) {
  return (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
          <Filter size={15} strokeWidth={1.75} /> Categories
        </h3>
        <div className="flex flex-col gap-0.5">
          <Link
            href="/search"
            className={
              !selectedCategoryId
                ? 'flex items-center justify-between rounded-lg bg-copper-50 px-3 py-2 text-sm font-medium text-copper-700'
                : 'flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50'
            }
          >
            <span>All categories</span>
          </Link>
          {CATEGORIES.map(cat => {
            const active = selectedCategoryId === cat.id;
            return (
              <Link
                key={cat.id}
                href={active ? '/search' : `/search?categoryId=${cat.id}`}
                className={
                  active
                    ? 'flex items-center justify-between rounded-lg bg-copper-50 px-3 py-2 text-sm font-medium text-copper-700'
                    : 'flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50'
                }
              >
                <span>{cat.name}</span>
                <ChevronRight size={14} strokeWidth={2} className={active ? 'text-copper-500' : 'text-neutral-300'} />
              </Link>
            );
          })}
        </div>
      </div>

      {allBrands.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
            Brands
          </h3>
          <div className="flex flex-col gap-1.5">
            {allBrands.slice(0, 30).map(b => {
              const checked = selectedBrands.includes(b);
              const next = toggleBrand(selectedBrands, b);
              const href = `/search?brands=${encodeURIComponent(next.join(','))}`;
              return (
                <Link
                  key={b}
                  href={href}
                  className={
                    checked
                      ? 'flex items-center justify-between rounded-lg bg-copper-50 px-3 py-1.5 text-xs font-medium text-copper-700'
                      : 'flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50'
                  }
                >
                  <span className="truncate">{b}</span>
                  {checked && <X size={12} strokeWidth={2} className="text-copper-500" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function toggleBrand(list: string[], b: string): string[] {
  return list.includes(b) ? list.filter(x => x !== b) : [...list, b];
}

interface ActiveChipsProps {
  q: string;
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  brands: string[];
  sort: string;
}

function ActiveFilterChips({ q, categoryId, subcategoryId, brands }: ActiveChipsProps) {
  const chips: Array<{ label: string; href: string }> = [];

  if (q) chips.push({ label: `Query: ${q}`, href: removeParam('q') });
  if (categoryId) {
    const cat = getCategoryById(categoryId);
    if (cat) chips.push({ label: `Category: ${cat.name}`, href: removeParam('categoryId', 'subcategoryId') });
  }
  if (subcategoryId) {
    const sub = getSubcategoryById(subcategoryId);
    if (sub) chips.push({ label: `Subcategory: ${sub.name}`, href: removeParam('subcategoryId') });
  }
  for (const b of brands) {
    chips.push({
      label: `Brand: ${b}`,
      href: removeParamBrand(b, brands),
    });
  }
  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <Link
          key={i}
          href={c.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
        >
          {c.label}
          <X size={12} strokeWidth={2} />
        </Link>
      ))}
      <Link
        href="/search"
        className="inline-flex items-center gap-1 rounded-full border border-copper-400 bg-copper-50 px-3 py-1.5 text-xs font-semibold text-copper-700 hover:bg-copper-100"
      >
        Clear all
      </Link>
    </div>
  );
}

function removeParam(...names: string[]): string {
  const u = typeof window !== 'undefined'
    ? new URL(window.location.href)
    : new URL('http://x/search');
  for (const n of names) u.searchParams.delete(n);
  u.searchParams.delete('page');
  const qs = u.searchParams.toString();
  return '/search' + (qs ? `?${qs}` : '');
}

function removeParamBrand(b: string, all: string[]): string {
  const u = typeof window !== 'undefined'
    ? new URL(window.location.href)
    : new URL('http://x/search');
  const next = all.filter(x => x !== b);
  if (next.length) u.searchParams.set('brands', next.join(','));
  else u.searchParams.delete('brands');
  u.searchParams.delete('page');
  const qs = u.searchParams.toString();
  return '/search' + (qs ? `?${qs}` : '');
}

function buildSearchUrl(
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
  const str = qs.toString();
  return '/search' + (str ? `?${str}` : '');
}

function computePageNumber(i: number, page: number, totalPages: number): number {
  if (totalPages <= 7) return i + 1;
  const half = 3;
  const pivot = Math.max(half + 1, Math.min(totalPages - half, page));
  return pivot - half + i;
}
