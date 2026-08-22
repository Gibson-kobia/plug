'use server';

import { revalidatePath } from 'next/cache';
import { requireJwt } from '@/lib/auth/require';
import { createAdminClient } from '@/lib/supabase/admin';
import { uploadBufferToStorage } from '@/lib/supabase/storage';
import { resolveCategoryId, resolveBrandId } from '@/lib/seller/queries';
import { logAdminAudit } from '@/lib/admin/audit';
import type { ListingDraftPayload, UsedListingCondition } from './types';

export interface SellerActionResponse {
  success: boolean;
  message: string;
  listingId?: string | undefined;
  data?: any;
  error?: string | undefined;
}

/**
 * Normalizes Kenyan phone numbers to +254XXXXXXXXX or 07XXXXXXXX format.
 */
function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+254')) return cleaned;
  if (cleaned.startsWith('254')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+254${cleaned.slice(1)}`;
  return cleaned;
}

// -----------------------------------------------------------------------------
// SELLER KYC ACTION
// -----------------------------------------------------------------------------

/**
 * Submits Seller KYC documents and creates/updates the seller profile.
 */
export async function submitSellerKycAction(formData: FormData): Promise<SellerActionResponse> {
  try {
    const session = await requireJwt();
    const supabase = createAdminClient();

    const businessName = (formData.get('businessName') as string || '').trim();
    const location = (formData.get('location') as string || '').trim();
    const county = (formData.get('county') as string || 'Nairobi').trim();
    const rawPhone = (formData.get('phone') as string || '').trim();
    const docType = (formData.get('documentType') as string || 'national_id') as 'national_id' | 'passport' | 'huduma_card';
    const documentNumber = (formData.get('documentNumber') as string || '').trim();

    if (!businessName) return { success: false, message: 'Business or Store Name is required' };
    if (!location) return { success: false, message: 'Shop Physical Location is required' };
    if (!rawPhone) return { success: false, message: 'WhatsApp Business Number is required' };
    if (!documentNumber) return { success: false, message: 'ID / Passport / Huduma Number is required' };

    const phone = normalizeKenyanPhone(rawPhone);
    if (!/^(\+254|0)?(1[01]\d{7}|[7]\d{8})$/.test(phone)) {
      return { success: false, message: 'Please enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678)' };
    }

    // Process File Uploads
    const frontFile = formData.get('frontImage') as File | null;
    const backFile = formData.get('backImage') as File | null;
    const selfieFile = formData.get('selfieImage') as File | null;

    let frontImageUrl = (formData.get('existingFrontUrl') as string) || '';
    let backImageUrl = (formData.get('existingBackUrl') as string) || '';
    let selfieUrl = (formData.get('existingSelfieUrl') as string) || '';

    const timestamp = Date.now();

    if (frontFile && frontFile.size > 0) {
      const buffer = Buffer.from(await frontFile.arrayBuffer());
      const ext = frontFile.name.split('.').pop() || 'jpg';
      const path = `kyc/${session.userId}/${timestamp}_front.${ext}`;
      const uploadRes = await uploadBufferToStorage('kyc-documents', path, buffer, frontFile.type || 'image/jpeg', false);
      if (!uploadRes.url) {
        return { success: false, message: `Failed to upload Front ID: ${uploadRes.error}` };
      }
      frontImageUrl = uploadRes.url;
    }

    if (backFile && backFile.size > 0) {
      const buffer = Buffer.from(await backFile.arrayBuffer());
      const ext = backFile.name.split('.').pop() || 'jpg';
      const path = `kyc/${session.userId}/${timestamp}_back.${ext}`;
      const uploadRes = await uploadBufferToStorage('kyc-documents', path, buffer, backFile.type || 'image/jpeg', false);
      if (!uploadRes.url) {
        return { success: false, message: `Failed to upload Back ID: ${uploadRes.error}` };
      }
      backImageUrl = uploadRes.url;
    }

    if (selfieFile && selfieFile.size > 0) {
      const buffer = Buffer.from(await selfieFile.arrayBuffer());
      const ext = selfieFile.name.split('.').pop() || 'jpg';
      const path = `kyc/${session.userId}/${timestamp}_selfie.${ext}`;
      const uploadRes = await uploadBufferToStorage('kyc-documents', path, buffer, selfieFile.type || 'image/jpeg', false);
      if (!uploadRes.url) {
        return { success: false, message: `Failed to upload Selfie: ${uploadRes.error}` };
      }
      selfieUrl = uploadRes.url;
    }

    if (!frontImageUrl) {
      return { success: false, message: 'Front photo of your National ID / Passport / Huduma Card is required' };
    }
    if (!selfieUrl) {
      return { success: false, message: 'A selfie holding your ID for liveness verification is required' };
    }

    // Ensure profiles entry exists for session.userId
    const { data: profileCheck } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.userId)
      .maybeSingle();

    if (!profileCheck) {
      // Find role for seller
      const { data: sellerRole } = await supabase
        .from('roles')
        .select('id')
        .eq('slug', 'seller')
        .maybeSingle();

      const roleId = sellerRole?.id || '00000000-0000-0000-0000-000000000002';

      await supabase.from('profiles').insert({
        id: session.userId,
        role_id: roleId,
        full_name: businessName,
        phone,
      });
    }

    // Upsert seller_profiles
    const { data: existingSeller } = await supabase
      .from('seller_profiles')
      .select('id, kyc_status')
      .eq('profile_id', session.userId)
      .is('deleted_at', null)
      .maybeSingle();

    let sellerProfileId = existingSeller?.id;

    if (sellerProfileId) {
      const { error: updateErr } = await supabase
        .from('seller_profiles')
        .update({
          display_name: businessName,
          whatsapp_number: phone,
          location,
          county,
          kyc_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sellerProfileId);

      if (updateErr) {
        return { success: false, message: `Error updating seller profile: ${updateErr.message}` };
      }
    } else {
      const { data: newProfile, error: insertErr } = await supabase
        .from('seller_profiles')
        .insert({
          profile_id: session.userId,
          display_name: businessName,
          whatsapp_number: phone,
          location,
          county,
          kyc_status: 'pending',
          verified: false,
          rating_avg: 5.0,
          listings_count: 0,
        })
        .select('id')
        .single();

      if (insertErr || !newProfile) {
        return { success: false, message: `Error creating seller profile: ${insertErr?.message}` };
      }
      sellerProfileId = newProfile.id;
    }

    // Insert into seller_verification_documents
    const { error: docErr } = await supabase
      .from('seller_verification_documents')
      .insert({
        seller_profile_id: sellerProfileId,
        document_type: docType,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl || null,
        selfie_with_id_url: selfieUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });

    if (docErr) {
      return { success: false, message: `Error recording verification documents: ${docErr.message}` };
    }

    // Audit log
    await logAdminAudit({
      actorUserId: session.userId,
      action: 'seller.kyc_submitted',
      targetType: 'seller_profile',
      targetId: sellerProfileId,
      after: { displayName: businessName, phone, docType, status: 'pending' },
    });

    revalidatePath('/seller');
    revalidatePath('/seller/kyc');
    revalidatePath('/admin/sellers');
    revalidatePath('/admin');

    return {
      success: true,
      message: 'KYC documents submitted successfully. Verification is in progress.',
    };
  } catch (err: any) {
    console.error('[submitSellerKycAction] Error:', err);
    return { success: false, message: err.message || 'Authentication or server error occurred' };
  }
}

// -----------------------------------------------------------------------------
// LISTING IMAGE UPLOAD ACTION
// -----------------------------------------------------------------------------

/**
 * Uploads a product photo to Supabase Storage bucket `listing-photos`.
 */
export async function uploadListingPhotoAction(formData: FormData): Promise<SellerActionResponse> {
  try {
    const session = await requireJwt();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return { success: false, message: 'No image file provided' };
    }

    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: 'Image size exceeds 8MB maximum limit' };
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { success: false, message: 'Invalid image format. Only JPEG, PNG, or WebP allowed' };
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `listings/${session.userId}/${timestamp}_${randomId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadRes = await uploadBufferToStorage('listing-photos', filePath, buffer, file.type, true);

    if (!uploadRes.url) {
      return { success: false, message: `Upload failed: ${uploadRes.error}` };
    }

    return {
      success: true,
      message: 'Photo uploaded successfully',
      data: { url: uploadRes.url },
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authentication required for uploading photos' };
  }
}

// -----------------------------------------------------------------------------
// SAVE LISTING DRAFT ACTION
// -----------------------------------------------------------------------------

/**
 * Saves or updates a listing draft in public.used_listings and public.listing_drafts.
 */
export async function saveListingDraftAction(payload: ListingDraftPayload): Promise<SellerActionResponse> {
  try {
    const session = await requireJwt();
    const supabase = createAdminClient();

    if (!payload.title || !payload.title.trim()) {
      return { success: false, message: 'Product title is required to save a draft' };
    }

    const categoryId = await resolveCategoryId(payload.categorySlugOrId);
    const brandId = await resolveBrandId(payload.brandName);
    const priceKes = Math.max(0, Number(payload.priceKes) || 0);

    let listingId = payload.listingId;

    if (listingId) {
      // Check ownership
      const { data: existing, error: fetchErr } = await supabase
        .from('used_listings')
        .select('id, seller_id, status')
        .eq('id', listingId)
        .maybeSingle();

      if (fetchErr || !existing) {
        return { success: false, message: 'Listing not found' };
      }

      if (existing.seller_id !== session.userId) {
        return { success: false, message: 'Unauthorized: You do not own this listing' };
      }

      // Update listing fields
      const { error: updateErr } = await supabase
        .from('used_listings')
        .update({
          category_id: categoryId,
          brand_id: brandId,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          price_kes: priceKes,
          negotiable: Boolean(payload.negotiable),
          condition: payload.condition || 'good',
          location: payload.location?.trim() || null,
          county: payload.county?.trim() || 'Nairobi',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (updateErr) {
        return { success: false, message: `Failed to update listing: ${updateErr.message}` };
      }
    } else {
      // Create new draft listing
      const { data: newListing, error: insertErr } = await supabase
        .from('used_listings')
        .insert({
          seller_id: session.userId,
          category_id: categoryId,
          brand_id: brandId,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          price_kes: priceKes,
          negotiable: Boolean(payload.negotiable),
          condition: payload.condition || 'good',
          location: payload.location?.trim() || null,
          county: payload.county?.trim() || 'Nairobi',
          status: 'draft_seller',
          verified_listing: false,
        })
        .select('id')
        .single();

      if (insertErr || !newListing) {
        return { success: false, message: `Failed to create draft listing: ${insertErr?.message}` };
      }
      listingId = newListing.id;
    }

    // Sync photos in used_listing_photos
    if (listingId && Array.isArray(payload.photos)) {
      // Clear old photos and reinsert
      await supabase.from('used_listing_photos').delete().eq('listing_id', listingId);

      if (payload.photos.length > 0) {
        const photoInserts = payload.photos.map((url, idx) => ({
          listing_id: listingId,
          url,
          sort_order: idx,
          status: 'pending_review' as const,
        }));
        await supabase.from('used_listing_photos').insert(photoInserts);
      }
    }

    // Save JSON draft content
    if (listingId) {
      const { data: existingDraft } = await supabase
        .from('listing_drafts')
        .select('id')
        .eq('listing_id', listingId)
        .eq('seller_id', session.userId)
        .maybeSingle();

      if (existingDraft) {
        await supabase
          .from('listing_drafts')
          .update({
            step: payload.step || 1,
            content: payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDraft.id);
      } else {
        await supabase.from('listing_drafts').insert({
          seller_id: session.userId,
          listing_id: listingId,
          step: payload.step || 1,
          content: payload,
        });
      }
    }

    revalidatePath('/seller');
    return {
      success: true,
      message: 'Draft saved successfully',
      listingId,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// SUBMIT LISTING FOR REVIEW ACTION
// -----------------------------------------------------------------------------

/**
 * Submits a listing for admin moderation review.
 */
export async function submitListingForReviewAction(
  listingId: string,
  payload?: ListingDraftPayload
): Promise<SellerActionResponse> {
  try {
    const session = await requireJwt();
    const supabase = createAdminClient();

    // 1. If payload is provided, first save the listing changes
    if (payload) {
      const saveRes = await saveListingDraftAction({ ...payload, listingId });
      if (!saveRes.success) return saveRes;
      if (saveRes.listingId) listingId = saveRes.listingId;
    }

    // 2. Verify listing ownership and fetch current state
    const { data: listing, error: fetchErr } = await supabase
      .from('used_listings')
      .select(`
        id,
        seller_id,
        title,
        price_kes,
        condition,
        category_id,
        status,
        used_listing_photos (id, url)
      `)
      .eq('id', listingId)
      .maybeSingle();

    if (fetchErr || !listing) {
      return { success: false, message: 'Listing not found in database' };
    }

    if (listing.seller_id !== session.userId) {
      return { success: false, message: 'Unauthorized: You do not own this listing' };
    }

    // 3. Check Seller Profile & KYC status
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id, kyc_status, display_name, listings_count')
      .eq('profile_id', session.userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!sellerProfile) {
      return {
        success: false,
        message: 'Please complete your Seller Profile and submit KYC verification before submitting listings for review.',
      };
    }

    if (sellerProfile.kyc_status === 'rejected') {
      return {
        success: false,
        message: 'Your KYC verification was rejected. Please update and resubmit your KYC documents in the KYC portal before listing items.',
      };
    }

    // 4. Validate listing requirements
    if (!listing.title || listing.title.trim().length < 3) {
      return { success: false, message: 'Product title must be at least 3 characters long' };
    }

    if (!listing.price_kes || Number(listing.price_kes) <= 0) {
      return { success: false, message: 'Please enter a valid asking price greater than KSh 0' };
    }

    const photos = Array.isArray(listing.used_listing_photos) ? listing.used_listing_photos : [];
    if (photos.length === 0) {
      return { success: false, message: 'Please upload at least one product photo before submitting for moderation' };
    }

    const isResubmission = listing.status === 'rejected_with_reason';

    // 5. Mutate status to 'pending_review'
    const { error: updateErr } = await supabase
      .from('used_listings')
      .update({
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateErr) {
      return { success: false, message: `Failed to submit listing: ${updateErr.message}` };
    }

    // 6. Record moderation queue event
    await supabase.from('moderation_queue_events').insert({
      listing_id: listingId,
      moderator_id: null,
      action: isResubmission ? 'resubmitted' : 'submitted',
      note: isResubmission ? 'Seller corrected and resubmitted listing' : 'New listing submitted for moderation review',
    });

    // 7. Update seller listings count
    await supabase
      .from('seller_profiles')
      .update({
        listings_count: (sellerProfile.listings_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerProfile.id);

    // 8. Revalidate paths
    revalidatePath('/seller');
    revalidatePath('/seller/listings');
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');

    return {
      success: true,
      message: isResubmission
        ? 'Listing resubmitted for moderation review. Moderators will review within 2 hours.'
        : 'Listing submitted for moderation review. It will be published as soon as approved.',
      listingId,
    };
  } catch (err: any) {
    console.error('[submitListingForReviewAction] Error:', err);
    return { success: false, message: err.message || 'Authentication error' };
  }
}

// -----------------------------------------------------------------------------
// DELETE SELLER LISTING ACTION
// -----------------------------------------------------------------------------

/**
 * Soft-deletes a seller listing.
 */
export async function deleteSellerListingAction(listingId: string): Promise<SellerActionResponse> {
  try {
    const session = await requireJwt();
    const supabase = createAdminClient();

    const { data: listing, error: fetchErr } = await supabase
      .from('used_listings')
      .select('id, seller_id, title')
      .eq('id', listingId)
      .maybeSingle();

    if (fetchErr || !listing) {
      return { success: false, message: 'Listing not found' };
    }

    if (listing.seller_id !== session.userId) {
      return { success: false, message: 'Unauthorized: You do not own this listing' };
    }

    const { error: updateErr } = await supabase
      .from('used_listings')
      .update({
        status: 'deleted_soft',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateErr) {
      return { success: false, message: `Failed to delete listing: ${updateErr.message}` };
    }

    revalidatePath('/seller');
    revalidatePath('/seller/listings');
    revalidatePath('/admin/moderation');

    return {
      success: true,
      message: `Listing "${listing.title}" deleted successfully`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}
