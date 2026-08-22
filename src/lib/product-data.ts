import type { NormalizedProduct, SearchFilters, SearchResult, ProductImage } from '../types';
import { CATEGORIES, getCategoryById, getCategoryBySlug, getBrandByName } from './catalogue';

let productsCache: NormalizedProduct[] | null = null;

function loadProductsFromJson(): NormalizedProduct[] {
  if (typeof window !== 'undefined') return [];
  const { readFileSync, existsSync } = require('fs') as typeof import('fs');
  const { join } = require('path') as typeof import('path');
  const dataPath = join(process.cwd(), 'data', 'normalized-products.json');
  const researchPath = join(process.cwd(), 'data', 'product-market-research.json');
  if (!existsSync(dataPath)) return [];
  try {
    const raw = readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(raw) as NormalizedProduct[];

    let researchMap: Record<string, any> = {};
    if (existsSync(researchPath)) {
      try {
        const researchRaw = readFileSync(researchPath, 'utf8');
        const researchList = JSON.parse(researchRaw);
        for (const item of researchList) {
          if (item.candidateId) researchMap[item.candidateId] = item;
        }
      } catch (e) {
        console.error('[product-data] Failed to load product-market-research.json:', e);
      }
    }

    return parsed.map(p => {
      const res = researchMap[p.productId];
      if (res && res.priceStatus === 'VERIFIED' && typeof res.price === 'number') {
        return {
          ...p,
          marketRefPriceKes: res.price,
          marketPriceStatus: 'VERIFIED',
          marketPriceSource: res.sourceName,
          marketPriceSourceUrl: res.sourceUrl,
          marketPriceCheckedAt: res.checkedAt,
        };
      }
      return {
        ...p,
        marketPriceStatus: 'UNVERIFIED',
      };
    });
  } catch (e) {
    console.error('[product-data] Failed to load normalized-products.json:', e);
    return [];
  }
}

export function getAllProducts(): NormalizedProduct[] {
  if (productsCache) return productsCache;
  const all = loadProductsFromJson();
  const filtered = all.filter(p => {
    if (!p.primaryImageUrl) return false;
    if (p.imageCount < 1) return false;
    if (p.displayName && (p.displayName === 'image' || p.displayName === 'view' || p.displayName === 'download')) {
      return false;
    }
    return true;
  });
  productsCache = filtered;
  return filtered;
}

export function invalidateProductCache(): void {
  productsCache = null;
}

export function getProductById(productId: string): NormalizedProduct | undefined {
  return getAllProducts().find(p => p.productId === productId);
}

export function getProductBySlug(slug: string): NormalizedProduct | undefined {
  return getAllProducts().find(p => p.slug === slug);
}

export function getProductsByCategory(categoryId: string, limit?: number): NormalizedProduct[] {
  const result = getAllProducts()
    .filter(p => p.categoryId === categoryId)
    .sort((a, b) => {
      const aVerified = a.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      const bVerified = b.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;
      return b.imageCount - a.imageCount;
    });
  return limit ? result.slice(0, limit) : result;
}

export function getProductsBySubcategory(subcategoryId: string, limit?: number): NormalizedProduct[] {
  const result = getAllProducts()
    .filter(p => p.subcategoryId === subcategoryId)
    .sort((a, b) => {
      const aVerified = a.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      const bVerified = b.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;
      return b.imageCount - a.imageCount;
    });
  return limit ? result.slice(0, limit) : result;
}

export function getProductsByBrand(brandName: string, limit?: number): NormalizedProduct[] {
  const normalized = brandName.toLowerCase();
  const result = getAllProducts()
    .filter(p => p.brand?.toLowerCase() === normalized)
    .sort((a, b) => {
      const aVerified = a.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      const bVerified = b.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;
      return b.imageCount - a.imageCount;
    });
  return limit ? result.slice(0, limit) : result;
}

export function getFeaturedProducts(limit: number = 20): NormalizedProduct[] {
  return [...getAllProducts()]
    .sort((a, b) => {
      // 1. Verified market price first
      const aVerified = a.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      const bVerified = b.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;
      // 2. High/medium confidence
      const confScore = (p: NormalizedProduct) => (p.confidence === 'HIGH' ? 2 : p.confidence === 'MEDIUM' ? 1 : 0);
      const diffConf = confScore(b) - confScore(a);
      if (diffConf !== 0) return diffConf;
      // 3. Richer image count
      return b.imageCount - a.imageCount;
    })
    .slice(0, limit);
}

export function getRecentProducts(limit: number = 20): NormalizedProduct[] {
  return getAllProducts().slice(0, limit);
}

export function getTrendingProducts(limit: number = 20): NormalizedProduct[] {
  return [...getAllProducts()]
    .sort((a, b) => {
      // Prioritize items with highest image counts
      if (b.imageCount !== a.imageCount) return b.imageCount - a.imageCount;
      const aVerified = a.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      const bVerified = b.marketPriceStatus === 'VERIFIED' ? 1 : 0;
      return bVerified - aVerified;
    })
    .slice(0, limit);
}

export function getDistinctBrands(categoryId?: string): string[] {
  const products = categoryId ? getProductsByCategory(categoryId) : getAllProducts();
  const set = new Set<string>();
  for (const p of products) {
    if (p.brand) set.add(p.brand);
  }
  return Array.from(set).sort();
}

export function getCategoryStats(): Record<string, { assetCount: number; productCount: number; brands: string[] }> {
  const stats: Record<string, { assetCount: number; productCount: number; brands: Set<string> }> = {};
  for (const cat of CATEGORIES) {
    stats[cat.id] = { assetCount: 0, productCount: 0, brands: new Set<string>() };
  }
  const products = getAllProducts();
  for (const p of products) {
    if (!p.categoryId) continue;
    const entry = stats[p.categoryId];
    if (!entry) continue;
    entry.productCount++;
    entry.assetCount += p.imageCount;
    if (p.brand) entry.brands.add(p.brand);
  }
  return Object.fromEntries(
    Object.entries(stats).map(([id, s]) => [
      id,
      { assetCount: s.assetCount, productCount: s.productCount, brands: Array.from(s.brands).sort() },
    ])
  );
}

function searchScore(product: NormalizedProduct, queryLower: string): number {
  let score = 0;
  const dn = product.displayName?.toLowerCase() || '';
  const brand = product.brand?.toLowerCase() || '';
  const model = product.model?.toLowerCase() || '';
  const folder = product.sourceFolder?.toLowerCase() || '';

  if (dn === queryLower) score += 100;
  if (brand === queryLower) score += 80;
  if (model === queryLower) score += 80;

  if (dn.startsWith(queryLower)) score += 50;
  if (brand.startsWith(queryLower)) score += 40;
  if (model.startsWith(queryLower)) score += 40;

  if (dn.includes(queryLower)) score += 25;
  if (brand.includes(queryLower)) score += 20;
  if (model.includes(queryLower)) score += 18;
  if (folder.includes(queryLower)) score += 5;

  const terms = queryLower.split(/\s+/).filter(t => t.length >= 2);
  for (const term of terms) {
    if (dn.includes(term)) score += 10;
    if (brand.includes(term)) score += 8;
    if (model.includes(term)) score += 8;
  }

  if (product.confidence === 'HIGH') score += 3;
  if (product.confidence === 'MEDIUM') score += 1;
  if (product.imageCount >= 3) score += 2;

  return score;
}

export function searchProducts(filters: SearchFilters = {}): SearchResult {
  const all = getAllProducts();
  const {
    categoryId,
    subcategoryId,
    brands,
    searchQuery,
    minPriceKes,
    maxPriceKes,
    inStockOnly,
    page = 1,
    pageSize = 24,
    sortBy = 'relevance',
  } = filters;

  const queryLower = searchQuery?.trim().toLowerCase() || '';

  let filtered = all.filter(p => {
    if (categoryId && p.categoryId !== categoryId) return false;
    if (subcategoryId && p.subcategoryId !== subcategoryId) return false;
    if (brands?.length && (!p.brand || !brands.includes(p.brand))) return false;
    const effectivePrice = p.marketPriceStatus === 'VERIFIED' ? p.marketRefPriceKes : p.priceKes;
    if (typeof minPriceKes === 'number' && (typeof effectivePrice !== 'number' || effectivePrice < minPriceKes)) return false;
    if (typeof maxPriceKes === 'number' && (typeof effectivePrice !== 'number' || effectivePrice > maxPriceKes)) return false;
    if (inStockOnly && (typeof p.stockCount !== 'number' || p.stockCount <= 0)) return false;
    if (queryLower) {
      const s = searchScore(p, queryLower);
      if (s <= 0) return false;
      (p as NormalizedProduct & { _searchScore?: number })._searchScore = s;
    }
    return true;
  });

  const scored = filtered as (NormalizedProduct & { _searchScore?: number })[];

  switch (sortBy) {
    case 'price-asc':
      scored.sort((a, b) => {
        const priceA = a.marketPriceStatus === 'VERIFIED' ? a.marketRefPriceKes : a.priceKes;
        const priceB = b.marketPriceStatus === 'VERIFIED' ? b.marketRefPriceKes : b.priceKes;
        return (priceA ?? Infinity) - (priceB ?? Infinity);
      });
      break;
    case 'price-desc':
      scored.sort((a, b) => {
        const priceA = a.marketPriceStatus === 'VERIFIED' ? a.marketRefPriceKes : a.priceKes;
        const priceB = b.marketPriceStatus === 'VERIFIED' ? b.marketRefPriceKes : b.priceKes;
        return (priceB ?? -1) - (priceA ?? -1);
      });
      break;
    case 'name-asc':
      scored.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      break;
    case 'newest':
      scored.sort((a, b) => b.productId.localeCompare(a.productId));
      break;
    case 'relevance':
    default:
      if (queryLower) {
        scored.sort((a, b) => (b._searchScore ?? 0) - (a._searchScore ?? 0));
      } else {
        scored.sort((a, b) => b.imageCount - a.imageCount);
      }
      break;
  }

  const cleanScored = scored.map(({ _searchScore, ...rest }) => rest as NormalizedProduct);

  const totalCount = cleanScored.length;
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  const totalPages = Math.max(1, Math.ceil(totalCount / safeSize));
  const start = (safePage - 1) * safeSize;
  const pageProducts = cleanScored.slice(start, start + safeSize);

  const categoryFilter = categoryId ? getProductsByCategory(categoryId) : all;
  const availableBrandsSet = new Set<string>();
  const availableConditionsSet = new Set<string>();
  for (const p of categoryFilter) {
    if (p.brand) availableBrandsSet.add(p.brand);
    if (p.condition) availableConditionsSet.add(p.condition);
  }

  return {
    products: pageProducts,
    totalCount,
    page: safePage,
    pageSize: safeSize,
    totalPages,
    appliedFilters: filters,
    availableBrands: Array.from(availableBrandsSet).sort(),
    availableConditions: Array.from(availableConditionsSet).sort(),
  };
}

export function getProductBreadcrumbs(
  product: NormalizedProduct
): Array<{ label: string; href: string; isCurrent?: boolean }> {
  const crumbs: Array<{ label: string; href: string; isCurrent?: boolean }> = [
    { label: 'Home', href: '/' },
  ];
  if (product.categoryId) {
    const cat = getCategoryById(product.categoryId);
    if (cat) {
      crumbs.push({ label: cat.name, href: `/category/${cat.slug}` });
    }
  }
  crumbs.push({
    label: product.brand ? `${product.brand} ${product.displayName}` : product.displayName,
    href: `/product/${product.slug}`,
    isCurrent: true,
  });
  return crumbs;
}

export function getCategoryBreadcrumbs(
  categoryId: string,
  subcategoryId?: string
): Array<{ label: string; href: string; isCurrent?: boolean }> {
  const crumbs: Array<{ label: string; href: string; isCurrent?: boolean }> = [
    { label: 'Home', href: '/' },
  ];
  const cat = getCategoryById(categoryId);
  if (cat) {
    if (subcategoryId) {
      crumbs.push({ label: cat.name, href: `/category/${cat.slug}` });
      const sub = cat.subcategories.find(s => s.id === subcategoryId);
      if (sub) {
        crumbs.push({ label: sub.name, href: `/category/${cat.slug}/${sub.slug}`, isCurrent: true });
      }
    } else {
      crumbs.push({ label: cat.name, href: `/category/${cat.slug}`, isCurrent: true });
    }
  }
  return crumbs;
}

export type { ProductImage };
