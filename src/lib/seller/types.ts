export type UsedListingCondition =
  | 'new'
  | 'open_box'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'refurbished'
  | 'display';

export type UsedListingStatus =
  | 'draft_seller'
  | 'pending_review'
  | 'approved_moderator'
  | 'published'
  | 'rejected_with_reason'
  | 'sold_by_seller'
  | 'suspended_admin';

export type SellerKycStatus = 'unverified' | 'pending' | 'rejected' | 'approved';

export interface SellerProfileData {
  id: string;
  userId?: string | undefined;
  profileId?: string | undefined;
  displayName: string;
  whatsappNumber: string | null;
  bio?: string | null | undefined;
  location: string | null;
  county: string | null;
  verified: boolean;
  kycStatus: SellerKycStatus;
  ratingAverage?: number | undefined;
  ratingCount?: number | undefined;
  ratingAvg?: number | undefined;
  listingsCount?: number | undefined;
  totalReviews?: number | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface SellerKycDocumentData {
  id: string;
  sellerProfileId: string;
  documentType: 'national_id' | 'passport' | 'huduma_card';
  documentNumberMasked?: string | null | undefined;
  frontImageUrl: string;
  backImageUrl: string | null;
  selfieWithIdUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface SellerListingPhotoData {
  id: string;
  listingId?: string | undefined;
  url: string;
  sortOrder?: number | undefined;
  sort_order?: number | undefined;
  status?: 'pending_review' | 'approved' | 'rejected' | string | undefined;
}

export interface SellerListingItem {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  priceKes: number;
  negotiable: boolean;
  condition: UsedListingCondition;
  location: string | null;
  county: string | null;
  status: UsedListingStatus;
  verifiedListing: boolean;
  categoryId: string;
  categoryName?: string | undefined;
  brandId?: string | null | undefined;
  brandName?: string | null | undefined;
  model?: string | null | undefined;
  photos: string[];
  photoObjects?: SellerListingPhotoData[] | undefined;
  latestModerationNote?: string | null | undefined;
  latestModerationAction?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface SellerDashboardData {
  isAuthed: boolean;
  userId?: string | undefined;
  profile: SellerProfileData | null;
  kyc: SellerKycDocumentData | null;
  listings: SellerListingItem[];
  stats: {
    totalListings: number;
    activePublished: number;
    pendingReview: number;
    drafts: number;
    rejected: number;
    whatsappEnquiries: number;
    rating: number;
    kycStatus: 'unverified' | 'pending' | 'rejected' | 'approved';
  };
}

export interface ListingDraftPayload {
  listingId?: string | undefined;
  title: string;
  description?: string | undefined;
  priceKes: number;
  negotiable?: boolean | undefined;
  condition: UsedListingCondition;
  categorySlugOrId: string;
  subcategoryId?: string | undefined;
  brandName?: string | undefined;
  modelName?: string | undefined;
  location?: string | undefined;
  county?: string | undefined;
  photos: string[];
  step?: number | undefined;
}

export interface ListingSubmitPayload {
  listingId?: string | undefined;
  title: string;
  description?: string | undefined;
  priceKes: number;
  negotiable?: boolean | undefined;
  condition: UsedListingCondition;
  categorySlugOrId: string;
  subcategoryId?: string | undefined;
  brandName?: string | undefined;
  modelName?: string | undefined;
  location?: string | undefined;
  county?: string | undefined;
  photos: string[];
}
