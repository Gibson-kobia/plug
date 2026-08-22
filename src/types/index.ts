import type { Role, PermissionKey, AuthedSession } from './auth';
export * from './product-spec';

export type { Role, PermissionKey, AuthedSession };

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Brand {
  name: string;
  categoryIds: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  filename?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface ProductSpecs {
  ram?: string;
  storage?: string;
  battery_mah?: number;
  screen_size_in?: number;
  [key: string]: string | number | string[] | number[] | undefined;
}

export interface NormalizedProduct {
  productId: string;
  brand: string | null;
  model: string | null;
  displayName: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  sourceFolder: string | null;
  imageCount: number;
  primaryImageUrl: string;
  images: ProductImage[];
  specs: ProductSpecs;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  needsReview: boolean;
  priceKes?: number | undefined;
  marketRefPriceKes?: number | undefined;
  marketPriceStatus?: 'VERIFIED' | 'UNVERIFIED' | undefined;
  marketPriceSource?: string | undefined;
  marketPriceSourceUrl?: string | undefined;
  marketPriceCheckedAt?: string | undefined;
  stockCount?: number | undefined;
  warrantyMonths?: number | undefined;
  condition?: 'new' | 'used-likely-new' | 'used-good' | 'used-fair' | 'refurbished' | 'open-box' | 'demo' | undefined;
  badges?: string[] | undefined;
}

export interface CatalogueCoverageSummary {
  totalImageKitAssets: number;
  mergedProductCandidates: number;
  nonProductAssets: number;
  uncertainItems: number;
  productGroups: number;
  categoriesWithAssets: number;
  categoriesWithoutAssets: number;
  brandsDetectedInAssets: number;
  brandsMatchedToCatalogue: number;
  brandsInAssetsMissingFromCatalogue: number;
  brandsInCatalogueMissingFromAssets: number;
}

export interface SearchFilters {
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  brands?: string[] | undefined;
  searchQuery?: string | undefined;
  minPriceKes?: number | undefined;
  maxPriceKes?: number | undefined;
  inStockOnly?: boolean | undefined;
  conditions?: string[] | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | undefined;
}

export interface SearchResult {
  products: NormalizedProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  appliedFilters: SearchFilters;
  availableBrands: string[];
  availableConditions: string[];
}
