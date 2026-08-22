import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  SellerDashboardData,
  SellerListingItem,
  SellerProfileData,
  SellerKycDocumentData,
  UsedListingStatus,
  UsedListingCondition,
} from './types';

/**
 * Resolves a category UUID from slug or ID, ensuring existence in public.categories.
 */
export async function resolveCategoryId(categorySlugOrId: string, fallbackName?: string): Promise<string> {
  const supabase = createAdminClient();
  const slug = categorySlugOrId.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Check if it's already a valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categorySlugOrId);

  if (isUuid) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categorySlugOrId)
      .maybeSingle();
    if (cat) return cat.id;
  }

  // Lookup by slug
  const { data: catBySlug } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (catBySlug) return catBySlug.id;

  // Insert category if it doesn't exist
  const name = fallbackName || (categorySlugOrId.charAt(0).toUpperCase() + categorySlugOrId.slice(1).replace(/-/g, ' '));
  const { data: newCat, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description: `${name} category on Kenya Electronics Marketplace`,
    })
    .select('id')
    .single();

  if (error || !newCat) {
    // If conflict happened concurrently, fetch again
    const { data: fallback } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();
    if (fallback) return fallback.id;
    throw new Error(`Failed to resolve category ID for ${categorySlugOrId}: ${error?.message}`);
  }

  return newCat.id;
}

/**
 * Resolves a brand UUID from name, inserting into public.brands if necessary.
 */
export async function resolveBrandId(brandName?: string | null): Promise<string | null> {
  if (!brandName || !brandName.trim()) return null;
  const name = brandName.trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const supabase = createAdminClient();

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .or(`slug.eq.${slug},name.ilike.${name}`)
    .maybeSingle();

  if (brand) return brand.id;

  const { data: newBrand, error } = await supabase
    .from('brands')
    .insert({ name, slug })
    .select('id')
    .single();

  if (error || !newBrand) {
    const { data: fallback } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    return fallback?.id ?? null;
  }

  return newBrand.id;
}

/**
 * Fetches complete seller dashboard data for an authenticated user.
 */
export async function getSellerDashboardData(userId: string): Promise<SellerDashboardData> {
  const supabase = createAdminClient();

  try {
    // 1. Fetch Seller Profile
    const { data: profileRow } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('profile_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    let profile: SellerProfileData | null = null;
    if (profileRow) {
      profile = {
        id: profileRow.id,
        profileId: profileRow.profile_id,
        displayName: profileRow.display_name,
        whatsappNumber: profileRow.whatsapp_number,
        bio: profileRow.bio,
        location: profileRow.location,
        county: profileRow.county,
        verified: Boolean(profileRow.verified),
        kycStatus: profileRow.kyc_status,
        ratingAvg: Number(profileRow.rating_avg || 0),
        listingsCount: Number(profileRow.listings_count || 0),
        totalReviews: Number(profileRow.total_reviews || 0),
        createdAt: profileRow.created_at,
        updatedAt: profileRow.updated_at,
      };
    }

    // 2. Fetch Latest KYC Document Submission
    let kyc: SellerKycDocumentData | null = null;
    if (profile?.id) {
      const { data: kycRow } = await supabase
        .from('seller_verification_documents')
        .select('*')
        .eq('seller_profile_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (kycRow) {
        kyc = {
          id: kycRow.id,
          sellerProfileId: kycRow.seller_profile_id,
          documentType: kycRow.document_type,
          frontImageUrl: kycRow.front_image_url,
          backImageUrl: kycRow.back_image_url,
          selfieWithIdUrl: kycRow.selfie_with_id_url,
          status: kycRow.status,
          rejectionReason: kycRow.rejection_reason,
          submittedAt: kycRow.submitted_at,
          reviewedAt: kycRow.reviewed_at,
        };
      }
    }

    // 3. Fetch Seller Listings with Photos and Latest Moderation Event
    const { data: listingsRows, error: listErr } = await supabase
      .from('used_listings')
      .select(`
        id,
        seller_id,
        category_id,
        brand_id,
        title,
        description,
        price_kes,
        negotiable,
        condition,
        location,
        county,
        status,
        verified_listing,
        created_at,
        updated_at,
        categories (name, slug),
        brands (name, slug),
        used_listing_photos (id, url, sort_order, status),
        moderation_queue_events (action, note, reason_template, created_at)
      `)
      .eq('seller_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (listErr) {
      console.error('[getSellerDashboardData] Listings fetch error:', listErr.message);
    }

    const listings: SellerListingItem[] = (listingsRows || []).map((l: any) => {
      const photos = Array.isArray(l.used_listing_photos)
        ? l.used_listing_photos
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((p: any) => p.url)
        : [];

      const latestModEvent = Array.isArray(l.moderation_queue_events) && l.moderation_queue_events.length > 0
        ? l.moderation_queue_events.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;

      const categoryName = Array.isArray(l.categories)
        ? l.categories[0]?.name
        : (l.categories as any)?.name;
      const brandName = Array.isArray(l.brands)
        ? l.brands[0]?.name
        : (l.brands as any)?.name;

      return {
        id: l.id,
        sellerId: l.seller_id,
        title: l.title,
        description: l.description,
        priceKes: Number(l.price_kes || 0),
        negotiable: Boolean(l.negotiable),
        condition: l.condition as UsedListingCondition,
        location: l.location,
        county: l.county,
        status: l.status as UsedListingStatus,
        verifiedListing: Boolean(l.verified_listing),
        categoryId: l.category_id,
        categoryName,
        brandId: l.brand_id,
        brandName,
        photos,
        photoObjects: l.used_listing_photos,
        latestModerationNote: latestModEvent?.note || latestModEvent?.reason_template,
        latestModerationAction: latestModEvent?.action,
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      };
    });

    // 4. Compute Accurate Aggregated Metrics
    const totalListings = listings.length;
    const activePublished = listings.filter((l) => l.status === 'published').length;
    const pendingReview = listings.filter((l) => l.status === 'pending_review').length;
    const drafts = listings.filter((l) => l.status === 'draft_seller').length;
    const rejected = listings.filter((l) => l.status === 'rejected_with_reason').length;

    // Inquiries count (from listing_enquiries table)
    let whatsappEnquiries = 0;
    if (listings.length > 0) {
      const listingIds = listings.map((l) => l.id);
      const { count } = await supabase
        .from('listing_enquiries')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', listingIds);
      whatsappEnquiries = count || 0;
    }

    const effectiveKycStatus = profile?.kycStatus || (kyc ? kyc.status : 'unverified');

    return {
      isAuthed: true,
      userId,
      profile,
      kyc,
      listings,
      stats: {
        totalListings,
        activePublished,
        pendingReview,
        drafts,
        rejected,
        whatsappEnquiries,
        rating: profile?.ratingAvg || 5.0,
        kycStatus: effectiveKycStatus as any,
      },
    };
  } catch (err: any) {
    console.error('[getSellerDashboardData] Unexpected error:', err);
    return {
      isAuthed: true,
      userId,
      profile: null,
      kyc: null,
      listings: [],
      stats: {
        totalListings: 0,
        activePublished: 0,
        pendingReview: 0,
        drafts: 0,
        rejected: 0,
        whatsappEnquiries: 0,
        rating: 5.0,
        kycStatus: 'unverified',
      },
    };
  }
}

/**
 * Fetches a single listing for seller editing, enforcing ownership.
 */
export async function getSellerListingForEdit(
  listingId: string,
  userId: string
): Promise<SellerListingItem | null> {
  const supabase = createAdminClient();

  const { data: l, error } = await supabase
    .from('used_listings')
    .select(`
      id,
      seller_id,
      category_id,
      brand_id,
      title,
      description,
      price_kes,
      negotiable,
      condition,
      location,
      county,
      status,
      verified_listing,
      created_at,
      updated_at,
      categories (name, slug),
      brands (name, slug),
      used_listing_photos (id, url, sort_order, status),
      moderation_queue_events (action, note, reason_template, created_at)
    `)
    .eq('id', listingId)
    .eq('seller_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !l) return null;

  const photos = Array.isArray(l.used_listing_photos)
    ? l.used_listing_photos
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((p: any) => p.url)
    : [];

  const latestModEvent = Array.isArray(l.moderation_queue_events) && l.moderation_queue_events.length > 0
    ? l.moderation_queue_events.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  const categoryName = Array.isArray(l.categories)
    ? l.categories[0]?.name
    : (l.categories as any)?.name;
  const brandName = Array.isArray(l.brands)
    ? l.brands[0]?.name
    : (l.brands as any)?.name;

  return {
    id: l.id,
    sellerId: l.seller_id,
    title: l.title,
    description: l.description,
    priceKes: Number(l.price_kes || 0),
    negotiable: Boolean(l.negotiable),
    condition: l.condition as UsedListingCondition,
    location: l.location,
    county: l.county,
    status: l.status as UsedListingStatus,
    verifiedListing: Boolean(l.verified_listing),
    categoryId: l.category_id,
    categoryName,
    brandId: l.brand_id,
    brandName,
    photos,
    photoObjects: l.used_listing_photos,
    latestModerationNote: latestModEvent?.note || latestModEvent?.reason_template,
    latestModerationAction: latestModEvent?.action,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
}
