import type { Role } from '@/types';

export interface AdminStaffUser {
  id: string;
  email?: string;
  phone?: string;
  role: Exclude<Role, 'guest'>;
}

export interface AdminDashboardMetrics {
  pendingKyc: number;
  pendingListings: number;
  activeSellers: number;
  activeListings: number;
  pendingOrders: number;
  ordersRequiringFulfillment: number;
  dbConnected: boolean;
  lastChecked: string;
}

export interface ModerationListingItem {
  id: string;
  title: string;
  description: string | null;
  priceKes: number;
  condition: string;
  negotiable: boolean;
  location: string | null;
  county: string | null;
  status: string;
  sellerId: string;
  sellerName?: string | undefined;
  sellerPhone?: string | undefined;
  sellerVerified?: boolean | undefined;
  categoryName?: string | undefined;
  brandName?: string | undefined;
  photos: string[];
  submittedAt: string;
}

export interface SellerKycItem {
  id: string;
  profileId: string;
  displayName: string;
  whatsappNumber: string;
  location: string | null;
  county: string | null;
  verified: boolean;
  kycStatus: 'pending' | 'rejected' | 'approved';
  ratingAvg: number;
  listingsCount: number;
  createdAt: string;
  documents: {
    id: string;
    documentType: string;
    frontImageUrl: string;
    backImageUrl?: string | null | undefined;
    selfieWithIdUrl: string;
    livenessScore?: number | null | undefined;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string | null | undefined;
    submittedAt: string;
  }[];
}

export interface AdminOrderItem {
  id: string;
  ref: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  mode: 'delivery' | 'pickup';
  totalKes: number;
  deliveryZoneName?: string | undefined;
  pickupLocationName?: string | undefined;
  createdAt: string;
  itemsCount: number;
  items: {
    id: string;
    title: string;
    unitPriceKes: number;
    qty: number;
    lineTotalKes: number;
  }[];
  fulfillmentStatus?: string | undefined;
}

export interface AdminFulfillmentItem {
  id: string;
  orderId: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  partnerName: string | null;
  trackingNo: string | null;
  driverName: string | null;
  driverPhone: string | null;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_attempt' | 'returned';
  deliveryZoneName?: string | undefined;
  notes: string | null;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface AdminDeliveryZoneItem {
  id: string;
  name: string;
  slug: string;
  kind: 'nairobi' | 'outskirts' | 'nationwide';
  feeKes: number;
  etaMinDays: number;
  etaMaxDays: number;
  active: boolean;
  sortOrder: number;
  isConfigured: boolean;
}

export interface AdminPickupLocationItem {
  id: string;
  name: string;
  county: string;
  area: string | null;
  addressLine1: string;
  phone: string | null;
  active: boolean;
}

export interface AdminAuditLogItem {
  id: string;
  actorId: string | null;
  actorEmail?: string | undefined;
  actorSystem: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  createdAt: string;
  ipHash: string | null;
}

export interface AdminLeadItem {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string | null;
  sellerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  source: string;
  campaign: string | null;
  status: 'new' | 'contacted' | 'negotiating' | 'payment_pending' | 'converted' | 'lost' | 'cancelled';
  estimatedValueKes: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt?: string;
}

