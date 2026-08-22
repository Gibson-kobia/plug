import { supabase, isSupabaseConfigured } from './supabase';
import type { NormalizedProduct } from '../types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Maps a Supabase row from public.products into NormalizedProduct format.
 */
export function mapSupabaseRowToProduct(row: any): NormalizedProduct {
  const product: NormalizedProduct = {
    productId: row.product_id || row.id,
    slug: row.slug,
    displayName: row.display_name || row.title,
    brand: row.brand ?? row.brands?.name ?? null,
    model: row.model ?? null,
    categoryId: row.category_id ?? null,
    categoryName: row.category_name ?? row.categories?.name ?? null,
    subcategoryId: row.subcategory_id ?? null,
    subcategoryName: row.subcategory_name ?? null,
    confidence: (row.confidence as any) || 'HIGH',
    imageCount: row.image_count || (Array.isArray(row.images) ? row.images.length : 1),
    primaryImageUrl: row.primary_image_url || '',
    images: Array.isArray(row.images) ? row.images : [],
    specs: row.specs || {},
    sourceFolder: row.source_folder ?? null,
    needsReview: Boolean(row.needs_review),
  };

  if (row.price_kes !== null && row.price_kes !== undefined) {
    product.priceKes = Number(row.price_kes);
  }
  if (row.market_ref_price_kes !== null && row.market_ref_price_kes !== undefined) {
    product.marketRefPriceKes = Number(row.market_ref_price_kes);
  }
  if (row.market_price_status) {
    product.marketPriceStatus = row.market_price_status;
  }
  if (row.market_price_checked_at) {
    product.marketPriceCheckedAt = row.market_price_checked_at;
  }
  if (row.condition) {
    product.condition = row.condition;
  }

  return product;
}

/**
 * Maps a published used_listings row with its photos and seller profile into NormalizedProduct format.
 */
export function mapUsedListingToProduct(row: any): NormalizedProduct {
  const photos = Array.isArray(row.used_listing_photos)
    ? row.used_listing_photos
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((p: any) => p.url)
    : [];

  const primaryPhoto = photos[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
  const cleanSlug = `${slugify(row.title)}-${row.id.substring(0, 8)}`;

  const conditionMap: Record<string, NormalizedProduct['condition']> = {
    new: 'new',
    like_new: 'used-likely-new',
    good: 'used-good',
    fair: 'used-fair',
    refurbished: 'refurbished',
    open_box: 'open-box',
    display: 'demo',
  };

  return {
    productId: `listing_${row.id}`,
    slug: cleanSlug,
    displayName: row.title,
    brand: row.brands?.name ?? null,
    model: row.title,
    categoryId: row.categories?.slug || row.category_id,
    categoryName: row.categories?.name ?? 'Marketplace',
    subcategoryId: null,
    subcategoryName: null,
    sourceFolder: 'seller_marketplace',
    imageCount: Math.max(photos.length, 1),
    primaryImageUrl: primaryPhoto,
    images: photos.map((url: string, idx: number) => ({
      id: `${row.id}_${idx}`,
      url,
    })),
    specs: {
      location: row.location || 'Nairobi',
      county: row.county || 'Nairobi',
      negotiable: row.negotiable ? 'Yes' : 'No',
      sellerVerified: row.verified_listing ? 'Verified Seller' : 'Independent Seller',
      description: row.description || '',
    },
    confidence: 'HIGH',
    needsReview: false,
    priceKes: Number(row.price_kes || 0),
    marketRefPriceKes: Number(row.price_kes || 0),
    marketPriceStatus: 'VERIFIED',
    condition: conditionMap[row.condition] || 'used-good',
    badges: ['Verified Seller', 'Marketplace Listing'],
  };
}

/**
 * Asynchronously fetches published used listings from Supabase.
 */
export async function fetchPublishedUsedListings(): Promise<NormalizedProduct[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('used_listings')
      .select(`
        id,
        title,
        description,
        price_kes,
        negotiable,
        condition,
        location,
        county,
        status,
        verified_listing,
        category_id,
        brand_id,
        categories (name, slug),
        brands (name, slug),
        used_listing_photos (url, sort_order)
      `)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapUsedListingToProduct);
  } catch (err) {
    console.error('[supabase-products] Error fetching published used listings:', err);
    return [];
  }
}

/**
 * Asynchronously fetches all products from Supabase with optional caching.
 */
export async function fetchProductsFromSupabase(): Promise<NormalizedProduct[] | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const [productsRes, usedListingsRes] = await Promise.all([
      supabase.from('products').select('*').order('id', { ascending: true }).limit(2000),
      supabase
        .from('used_listings')
        .select(`
          id,
          title,
          description,
          price_kes,
          negotiable,
          condition,
          location,
          county,
          status,
          verified_listing,
          category_id,
          brand_id,
          categories (name, slug),
          brands (name, slug),
          used_listing_photos (url, sort_order)
        `)
        .eq('status', 'published')
        .is('deleted_at', null),
    ]);

    const catalogProducts = (productsRes.data || []).map(mapSupabaseRowToProduct);
    const marketplaceListings = (usedListingsRes.data || []).map(mapUsedListingToProduct);

    return [...marketplaceListings, ...catalogProducts];
  } catch (err) {
    console.error('[supabase-products] Unexpected error fetching from Supabase:', err);
    return null;
  }
}
