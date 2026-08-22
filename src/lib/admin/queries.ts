import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  AdminDashboardMetrics,
  ModerationListingItem,
  SellerKycItem,
  AdminOrderItem,
  AdminFulfillmentItem,
  AdminDeliveryZoneItem,
  AdminPickupLocationItem,
  AdminAuditLogItem,
  AdminLeadItem,
} from './types';

/**
 * Fetches high-level metrics for the Admin Dashboard.
 * Queries real database tables using aggregation counts.
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  try {
    const [
      pendingKycRes,
      pendingListingsRes,
      activeSellersRes,
      activeListingsRes,
      pendingOrdersRes,
      fulfillmentsRes,
    ] = await Promise.all([
      supabase
        .from('seller_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'pending')
        .is('deleted_at', null),
      supabase
        .from('used_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review')
        .is('deleted_at', null),
      supabase
        .from('seller_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true)
        .is('deleted_at', null),
      supabase
        .from('used_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending_whatsapp', 'customer_contacted', 'confirmed']),
      supabase
        .from('order_fulfillments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['assigned', 'picked_up', 'in_transit', 'out_for_delivery']),
    ]);

    const isConnected =
      !pendingKycRes.error &&
      !pendingListingsRes.error &&
      !activeSellersRes.error &&
      !activeListingsRes.error;

    return {
      pendingKyc: pendingKycRes.count ?? 0,
      pendingListings: pendingListingsRes.count ?? 0,
      activeSellers: activeSellersRes.count ?? 0,
      activeListings: activeListingsRes.count ?? 0,
      pendingOrders: pendingOrdersRes.count ?? 0,
      ordersRequiringFulfillment: fulfillmentsRes.count ?? 0,
      dbConnected: isConnected,
      lastChecked: now,
    };
  } catch (err) {
    console.error('[getAdminDashboardMetrics] DB Query Exception:', err);
    return {
      pendingKyc: 0,
      pendingListings: 0,
      activeSellers: 0,
      activeListings: 0,
      pendingOrders: 0,
      ordersRequiringFulfillment: 0,
      dbConnected: false,
      lastChecked: now,
    };
  }
}

/**
 * Fetches pending or filtered listings for the Moderation Queue.
 */
export async function getModerationQueue(
  statusFilter: string = 'pending_review',
  limit: number = 50
): Promise<{ items: ModerationListingItem[]; dbConnected: boolean }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('used_listings')
      .select(`
        id,
        title,
        description,
        price_kes,
        condition,
        negotiable,
        location,
        county,
        status,
        seller_id,
        created_at,
        used_listing_photos (url, sort_order)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: listings, error } = await query;

    if (error || !listings) {
      console.warn('[getModerationQueue] Error querying listings:', error?.message);
      return { items: [], dbConnected: false };
    }

    // Collect seller IDs to fetch seller details
    const sellerIds = Array.from(new Set(listings.map((l: any) => l.seller_id).filter(Boolean)));
    const sellerMap = new Map<string, { displayName: string; whatsappNumber: string; verified: boolean }>();

    if (sellerIds.length > 0) {
      const { data: sellers } = await supabase
        .from('seller_profiles')
        .select('profile_id, display_name, whatsapp_number, verified')
        .in('profile_id', sellerIds);

      if (sellers) {
        for (const s of sellers) {
          sellerMap.set(s.profile_id, {
            displayName: s.display_name,
            whatsappNumber: s.whatsapp_number,
            verified: s.verified,
          });
        }
      }
    }

    const items: ModerationListingItem[] = listings.map((l: any) => {
      const seller = sellerMap.get(l.seller_id);
      const photos = Array.isArray(l.used_listing_photos)
        ? l.used_listing_photos
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((p: any) => p.url)
        : [];

      return {
        id: l.id,
        title: l.title,
        description: l.description,
        priceKes: Number(l.price_kes || 0),
        condition: l.condition,
        negotiable: Boolean(l.negotiable),
        location: l.location,
        county: l.county,
        status: l.status,
        sellerId: l.seller_id,
        sellerName: seller?.displayName ?? 'Independent Seller',
        sellerPhone: seller?.whatsappNumber,
        sellerVerified: seller?.verified ?? false,
        photos,
        submittedAt: l.created_at,
      };
    });

    return { items, dbConnected: true };
  } catch (err) {
    console.error('[getModerationQueue] Exception:', err);
    return { items: [], dbConnected: false };
  }
}

/**
 * Fetches seller KYC verification submissions.
 */
export async function getSellerKycSubmissions(
  statusFilter: string = 'pending',
  limit: number = 50
): Promise<{ items: SellerKycItem[]; dbConnected: boolean }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('seller_profiles')
      .select(`
        id,
        profile_id,
        display_name,
        whatsapp_number,
        location,
        county,
        verified,
        kyc_status,
        rating_avg,
        listings_count,
        created_at,
        seller_verification_documents (
          id,
          document_type,
          front_image_url,
          back_image_url,
          selfie_with_id_url,
          liveness_score,
          status,
          rejection_reason,
          submitted_at
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter !== 'all') {
      query = query.eq('kyc_status', statusFilter);
    }

    const { data: sellers, error } = await query;

    if (error || !sellers) {
      console.warn('[getSellerKycSubmissions] Error querying seller KYC:', error?.message);
      return { items: [], dbConnected: false };
    }

    const items: SellerKycItem[] = sellers.map((s: any) => {
      const rawDocs = Array.isArray(s.seller_verification_documents)
        ? s.seller_verification_documents
        : [];

      return {
        id: s.id,
        profileId: s.profile_id,
        displayName: s.display_name,
        whatsappNumber: s.whatsapp_number,
        location: s.location,
        county: s.county,
        verified: Boolean(s.verified),
        kycStatus: s.kyc_status,
        ratingAvg: Number(s.rating_avg || 0),
        listingsCount: Number(s.listings_count || 0),
        createdAt: s.created_at,
        documents: rawDocs.map((d: any) => ({
          id: d.id,
          documentType: d.document_type,
          frontImageUrl: d.front_image_url,
          backImageUrl: d.back_image_url,
          selfieWithIdUrl: d.selfie_with_id_url,
          livenessScore: d.liveness_score ? Number(d.liveness_score) : null,
          status: d.status,
          rejectionReason: d.rejection_reason,
          submittedAt: d.submitted_at,
        })),
      };
    });

    return { items, dbConnected: true };
  } catch (err) {
    console.error('[getSellerKycSubmissions] Exception:', err);
    return { items: [], dbConnected: false };
  }
}

/**
 * Fetches orders list with customer, zone, and line item details.
 */
export async function getAdminOrders(
  statusFilter: string = 'all',
  limit: number = 50
): Promise<{ items: AdminOrderItem[]; dbConnected: boolean }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        ref,
        customer_name,
        customer_phone,
        customer_email,
        status,
        mode,
        total_kes,
        created_at,
        delivery_zones (name),
        pickup_locations (name),
        order_items (
          id,
          unit_price_kes,
          qty,
          line_total_kes,
          variant_id,
          listing_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: orders, error } = await query;

    if (error || !orders) {
      console.warn('[getAdminOrders] Error querying orders:', error?.message);
      return { items: [], dbConnected: false };
    }

    const items: AdminOrderItem[] = orders.map((o: any) => {
      const rawItems = Array.isArray(o.order_items) ? o.order_items : [];
      return {
        id: o.id,
        ref: o.ref || o.id.slice(0, 8).toUpperCase(),
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerEmail: o.customer_email,
        status: o.status,
        mode: o.mode,
        totalKes: Number(o.total_kes || 0),
        deliveryZoneName: o.delivery_zones?.name,
        pickupLocationName: o.pickup_locations?.name,
        createdAt: o.created_at,
        itemsCount: rawItems.length,
        items: rawItems.map((item: any) => ({
          id: item.id,
          title: item.listing_id ? 'Seller Marketplace Item' : 'Catalogue Product',
          unitPriceKes: Number(item.unit_price_kes || 0),
          qty: Number(item.qty || 1),
          lineTotalKes: Number(item.line_total_kes || 0),
        })),
      };
    });

    return { items, dbConnected: true };
  } catch (err) {
    console.error('[getAdminOrders] Exception:', err);
    return { items: [], dbConnected: false };
  }
}

/**
 * Fetches fulfillment records adhering strictly to the 8-state schema.
 */
export async function getAdminFulfillments(
  statusFilter: string = 'all',
  limit: number = 50
): Promise<{ items: AdminFulfillmentItem[]; dbConnected: boolean }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('order_fulfillments')
      .select(`
        id,
        partner_name,
        tracking_no,
        driver_name,
        driver_phone,
        status,
        notes,
        estimated_delivery_at,
        delivered_at,
        created_at,
        order_fulfillment_groups (
          order_id,
          orders (
            id,
            ref,
            customer_name,
            customer_phone,
            delivery_zones (name)
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: fulfillments, error } = await query;

    if (error || !fulfillments) {
      console.warn('[getAdminFulfillments] Error querying fulfillments:', error?.message);
      return { items: [], dbConnected: false };
    }

    const items: AdminFulfillmentItem[] = fulfillments.map((f: any) => {
      const order = f.order_fulfillment_groups?.orders;
      return {
        id: f.id,
        orderId: order?.id || f.id,
        orderRef: order?.ref || order?.id?.slice(0, 8).toUpperCase() || 'N/A',
        customerName: order?.customer_name || 'Customer',
        customerPhone: order?.customer_phone || '',
        partnerName: f.partner_name,
        trackingNo: f.tracking_no,
        driverName: f.driver_name,
        driverPhone: f.driver_phone,
        status: f.status,
        deliveryZoneName: order?.delivery_zones?.name,
        notes: f.notes,
        estimatedDeliveryAt: f.estimated_delivery_at,
        deliveredAt: f.delivered_at,
        createdAt: f.created_at,
      };
    });

    return { items, dbConnected: true };
  } catch (err) {
    console.error('[getAdminFulfillments] Exception:', err);
    return { items: [], dbConnected: false };
  }
}

/**
 * Fetches delivery zones and pickup locations.
 */
export async function getAdminDeliverySettings(): Promise<{
  zones: AdminDeliveryZoneItem[];
  pickupLocations: AdminPickupLocationItem[];
  dbConnected: boolean;
}> {
  const supabase = createAdminClient();

  try {
    const [zonesRes, pickupsRes] = await Promise.all([
      supabase
        .from('delivery_zones')
        .select('*')
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      supabase
        .from('pickup_locations')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true }),
    ]);

    const isConnected = !zonesRes.error && !pickupsRes.error;

    const rawZones = zonesRes.data || [];
    const rawPickups = pickupsRes.data || [];

    const zones: AdminDeliveryZoneItem[] = rawZones.map((z: any) => ({
      id: z.id,
      name: z.name,
      slug: z.slug,
      kind: z.kind,
      feeKes: Number(z.fee_kes || 0),
      etaMinDays: Number(z.eta_min_days || 0),
      etaMaxDays: Number(z.eta_max_days || 1),
      active: Boolean(z.active),
      sortOrder: Number(z.sort_order || 0),
      isConfigured: Number(z.fee_kes) > 0,
    }));

    const pickupLocations: AdminPickupLocationItem[] = rawPickups.map((p: any) => ({
      id: p.id,
      name: p.name,
      county: p.county,
      area: p.area,
      addressLine1: p.address_line_1,
      phone: p.phone,
      active: Boolean(p.active),
    }));

    return { zones, pickupLocations, dbConnected: isConnected };
  } catch (err) {
    console.error('[getAdminDeliverySettings] Exception:', err);
    return { zones: [], pickupLocations: [], dbConnected: false };
  }
}

/**
 * Fetches append-only audit logs.
 */
export async function getAdminAuditLogs(
  limit: number = 100,
  actionFilter?: string
): Promise<{ items: AdminAuditLogItem[]; dbConnected: boolean }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        actor_id,
        actor_system,
        action,
        target_type,
        target_id,
        before,
        after,
        ip_hash,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionFilter && actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }

    const { data: logs, error } = await query;

    if (error || !logs) {
      console.warn('[getAdminAuditLogs] Error querying audit logs:', error?.message);
      return { items: [], dbConnected: false };
    }

    const items: AdminAuditLogItem[] = logs.map((l: any) => ({
      id: l.id,
      actorId: l.actor_id,
      actorSystem: l.actor_system,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      before: l.before,
      after: l.after,
      createdAt: l.created_at,
      ipHash: l.ip_hash,
    }));

    return { items, dbConnected: true };
  } catch (err) {
    console.error('[getAdminAuditLogs] Exception:', err);
    return { items: [], dbConnected: false };
  }
}

/**
 * Fetch leads from public.leads for CRM management.
 */
export async function getAdminLeads(
  statusFilter?: string,
  searchQuery?: string,
  limit: number = 50
): Promise<{ items: AdminLeadItem[]; dbConnected: boolean; totalEstimatedValueKes: number }> {
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery) {
      query = query.or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%,product_title.ilike.%${searchQuery}%`);
    }

    const { data: leads, error } = await query;

    if (error || !leads) {
      console.warn('[getAdminLeads] Error querying leads:', error?.message);
      return { items: [], dbConnected: false, totalEstimatedValueKes: 0 };
    }

    const items: AdminLeadItem[] = leads.map((l: any) => ({
      id: l.id,
      productId: l.product_id,
      productTitle: l.product_title,
      variantId: l.variant_id,
      sellerId: l.seller_id,
      customerName: l.customer_name,
      customerPhone: l.customer_phone,
      customerEmail: l.customer_email,
      source: l.source,
      campaign: l.campaign,
      status: l.status,
      estimatedValueKes: l.estimated_value_kes ? Number(l.estimated_value_kes) : null,
      notes: l.notes,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    }));

    const totalEstimatedValueKes = items.reduce((acc, item) => acc + (item.estimatedValueKes || 0), 0);

    return { items, dbConnected: true, totalEstimatedValueKes };
  } catch (err) {
    console.error('[getAdminLeads] Exception:', err);
    return { items: [], dbConnected: false, totalEstimatedValueKes: 0 };
  }
}

