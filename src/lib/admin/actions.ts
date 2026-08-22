'use server';

import { revalidatePath } from 'next/cache';
import { requirePermissionOrThrow } from '@/lib/auth/require';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAudit } from '@/lib/admin/audit';

export interface ActionResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

// -----------------------------------------------------------------------------
// LISTING MODERATION ACTIONS
// -----------------------------------------------------------------------------

/**
 * Approve a pending seller listing.
 */
export async function approveListingAction(
  listingId: string,
  notes?: string
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('moderate.listings');
    const supabase = createAdminClient();

    // Verify current status
    const { data: listing, error: fetchErr } = await supabase
      .from('used_listings')
      .select('id, status, title, seller_id')
      .eq('id', listingId)
      .single();

    if (fetchErr || !listing) {
      return { success: false, message: 'Listing not found in database' };
    }

    if (listing.status === 'published') {
      return { success: false, message: 'Listing is already approved and published' };
    }

    const { error: updateErr } = await supabase
      .from('used_listings')
      .update({
        status: 'published',
        verified_listing: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateErr) {
      return { success: false, message: `Failed to update listing: ${updateErr.message}` };
    }

    // Insert moderation queue event
    await supabase.from('moderation_queue_events').insert({
      listing_id: listingId,
      moderator_id: session.userId,
      action: 'approved',
      note: notes || 'Listing approved by moderator',
    });

    // Record audit log
    await logAdminAudit({
      actorUserId: session.userId,
      action: 'listing.approved',
      targetType: 'used_listing',
      targetId: listingId,
      before: { status: listing.status },
      after: { status: 'published', notes },
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    revalidatePath('/seller');
    revalidatePath('/seller/listings');
    revalidatePath('/');

    return { success: true, message: `Listing "${listing.title}" approved successfully` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

/**
 * Reject a pending seller listing with required reason.
 */
export async function rejectListingAction(
  listingId: string,
  reason: string
): Promise<ActionResponse> {
  try {
    if (!reason || reason.trim().length === 0) {
      return { success: false, message: 'Rejection reason is required' };
    }

    const session = await requirePermissionOrThrow('moderate.listings');
    const supabase = createAdminClient();

    const { data: listing, error: fetchErr } = await supabase
      .from('used_listings')
      .select('id, status, title')
      .eq('id', listingId)
      .single();

    if (fetchErr || !listing) {
      return { success: false, message: 'Listing not found in database' };
    }

    const { error: updateErr } = await supabase
      .from('used_listings')
      .update({
        status: 'rejected_with_reason',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateErr) {
      return { success: false, message: `Failed to reject listing: ${updateErr.message}` };
    }

    await supabase.from('moderation_queue_events').insert({
      listing_id: listingId,
      moderator_id: session.userId,
      action: 'rejected',
      note: reason,
    });

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'listing.rejected',
      targetType: 'used_listing',
      targetId: listingId,
      before: { status: listing.status },
      after: { status: 'rejected_with_reason', reason },
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    revalidatePath('/seller');
    revalidatePath('/seller/listings');

    return { success: true, message: `Listing "${listing.title}" rejected` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

/**
 * Bulk approve multiple safe listings.
 */
export async function bulkApproveListingsAction(
  listingIds: string[]
): Promise<ActionResponse> {
  try {
    if (!listingIds || listingIds.length === 0) {
      return { success: false, message: 'No listings selected' };
    }

    const session = await requirePermissionOrThrow('moderate.listings');
    const supabase = createAdminClient();

    const { error: updateErr } = await supabase
      .from('used_listings')
      .update({
        status: 'published',
        verified_listing: true,
        updated_at: new Date().toISOString(),
      })
      .in('id', listingIds)
      .eq('status', 'pending_review');

    if (updateErr) {
      return { success: false, message: `Bulk approve failed: ${updateErr.message}` };
    }

    // Insert moderation events
    const events = listingIds.map((id) => ({
      listing_id: id,
      moderator_id: session.userId,
      action: 'approved',
      note: 'Bulk approved by moderator',
    }));
    await supabase.from('moderation_queue_events').insert(events);

    // Audit log
    await logAdminAudit({
      actorUserId: session.userId,
      action: 'listing.bulk_approved',
      targetType: 'used_listing',
      after: { count: listingIds.length, listingIds },
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/admin');

    return { success: true, message: `Successfully approved ${listingIds.length} listings` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

/**
 * Bulk reject multiple listings.
 */
export async function bulkRejectListingsAction(
  listingIds: string[],
  reason: string
): Promise<ActionResponse> {
  try {
    if (!listingIds || listingIds.length === 0) {
      return { success: false, message: 'No listings selected' };
    }
    if (!reason || reason.trim().length === 0) {
      return { success: false, message: 'Rejection reason is required' };
    }

    const session = await requirePermissionOrThrow('moderate.listings');
    const supabase = createAdminClient();

    const { error: updateErr } = await supabase
      .from('used_listings')
      .update({
        status: 'rejected_with_reason',
        updated_at: new Date().toISOString(),
      })
      .in('id', listingIds);

    if (updateErr) {
      return { success: false, message: `Bulk reject failed: ${updateErr.message}` };
    }

    const events = listingIds.map((id) => ({
      listing_id: id,
      moderator_id: session.userId,
      action: 'rejected',
      note: reason,
    }));
    await supabase.from('moderation_queue_events').insert(events);

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'listing.bulk_rejected',
      targetType: 'used_listing',
      after: { count: listingIds.length, listingIds, reason },
    });

    revalidatePath('/admin/moderation');
    revalidatePath('/admin');

    return { success: true, message: `Successfully rejected ${listingIds.length} listings` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// SELLER KYC REVIEW ACTIONS
// -----------------------------------------------------------------------------

/**
 * Review seller KYC verification application.
 */
export async function reviewSellerKycAction(
  sellerProfileId: string,
  decision: 'approved' | 'rejected' | 'pending',
  notes?: string
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('sellers.verify');
    const supabase = createAdminClient();

    const { data: seller, error: fetchErr } = await supabase
      .from('seller_profiles')
      .select('id, display_name, kyc_status, verified')
      .eq('id', sellerProfileId)
      .single();

    if (fetchErr || !seller) {
      return { success: false, message: 'Seller profile not found' };
    }

    const isApproved = decision === 'approved';

    const { error: updateErr } = await supabase
      .from('seller_profiles')
      .update({
        kyc_status: decision,
        verified: isApproved,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerProfileId);

    if (updateErr) {
      return { success: false, message: `Failed to update seller KYC: ${updateErr.message}` };
    }

    // Update documents review state
    await supabase
      .from('seller_verification_documents')
      .update({
        status: decision,
        reviewed_by_id: session.userId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: decision === 'rejected' ? notes : null,
      })
      .eq('seller_profile_id', sellerProfileId);

    // Audit log
    await logAdminAudit({
      actorUserId: session.userId,
      action: `seller_kyc.${decision}`,
      targetType: 'seller_profile',
      targetId: sellerProfileId,
      before: { kyc_status: seller.kyc_status, verified: seller.verified },
      after: { kyc_status: decision, verified: isApproved, notes },
    });

    revalidatePath('/admin/sellers');
    revalidatePath('/admin');
    revalidatePath('/seller');
    revalidatePath('/seller/kyc');
    revalidatePath('/');

    return {
      success: true,
      message: `Seller "${seller.display_name}" KYC marked as ${decision.toUpperCase()}`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// ORDERS & FULFILLMENT ACTIONS
// -----------------------------------------------------------------------------

/**
 * Update order status adhering to the order_status enum.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  notes?: string
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('orders.manage');
    const supabase = createAdminClient();

    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, ref, status')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return { success: false, message: 'Order not found in database' };
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) {
      return { success: false, message: `Failed to update order status: ${updateErr.message}` };
    }

    // Record order event in FSM log
    await supabase.from('order_events').insert({
      order_id: orderId,
      from_status: order.status,
      to_status: newStatus,
      actor_type: 'admin',
      actor_id: session.userId,
      reason: notes || `Status changed to ${newStatus}`,
    });

    // Audit log
    await logAdminAudit({
      actorUserId: session.userId,
      action: 'order.status_change',
      targetType: 'order',
      targetId: orderId,
      before: { status: order.status },
      after: { status: newStatus, notes },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/admin/fulfillment');
    revalidatePath('/admin');

    return {
      success: true,
      message: `Order #${order.ref || orderId.slice(0, 8)} status updated to ${newStatus}`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

/**
 * Transition fulfillment status adhering to the 8-state schema.
 */
export async function transitionFulfillmentAction(
  fulfillmentId: string,
  data: {
    newStatus: string;
    partnerName?: string;
    trackingNo?: string;
    driverName?: string;
    driverPhone?: string;
    notes?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('fulfillment.manage');
    const supabase = createAdminClient();

    const { data: fulfillment, error: fetchErr } = await supabase
      .from('order_fulfillments')
      .select('id, status, group_id')
      .eq('id', fulfillmentId)
      .single();

    if (fetchErr || !fulfillment) {
      return { success: false, message: 'Fulfillment record not found' };
    }

    const updates: Record<string, any> = {
      status: data.newStatus,
      updated_at: new Date().toISOString(),
    };

    if (data.partnerName !== undefined) updates.partner_name = data.partnerName;
    if (data.trackingNo !== undefined) updates.tracking_no = data.trackingNo;
    if (data.driverName !== undefined) updates.driver_name = data.driverName;
    if (data.driverPhone !== undefined) updates.driver_phone = data.driverPhone;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.newStatus === 'delivered') updates.delivered_at = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('order_fulfillments')
      .update(updates)
      .eq('id', fulfillmentId);

    if (updateErr) {
      return { success: false, message: `Failed to update fulfillment: ${updateErr.message}` };
    }

    // Audit log
    await logAdminAudit({
      actorUserId: session.userId,
      action: 'fulfillment.status_transition',
      targetType: 'order_fulfillment',
      targetId: fulfillmentId,
      before: { status: fulfillment.status },
      after: updates,
    });

    revalidatePath('/admin/fulfillment');
    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    return {
      success: true,
      message: `Fulfillment status transitioned to ${data.newStatus.toUpperCase()}`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// DELIVERY ZONES & SETTINGS ACTIONS
// -----------------------------------------------------------------------------

/**
 * Update delivery zone fee, ETA, or active status.
 */
export async function updateDeliveryZoneAction(
  zoneId: string,
  data: {
    feeKes?: number;
    etaMinDays?: number;
    etaMaxDays?: number;
    active?: boolean;
    name?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('delivery.manage');
    const supabase = createAdminClient();

    const { data: zone, error: fetchErr } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (fetchErr || !zone) {
      return { success: false, message: 'Delivery zone not found' };
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.feeKes !== undefined) updates.fee_kes = data.feeKes;
    if (data.etaMinDays !== undefined) updates.eta_min_days = data.etaMinDays;
    if (data.etaMaxDays !== undefined) updates.eta_max_days = data.etaMaxDays;
    if (data.active !== undefined) updates.active = data.active;
    if (data.name !== undefined) updates.name = data.name;

    const { error: updateErr } = await supabase
      .from('delivery_zones')
      .update(updates)
      .eq('id', zoneId);

    if (updateErr) {
      return { success: false, message: `Failed to update delivery zone: ${updateErr.message}` };
    }

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'delivery_zone.updated',
      targetType: 'delivery_zone',
      targetId: zoneId,
      before: zone,
      after: updates,
    });

    revalidatePath('/admin/settings/delivery');

    return { success: true, message: `Delivery zone "${zone.name}" updated successfully` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

/**
 * Update pickup location status or details.
 */
export async function updatePickupLocationAction(
  locationId: string,
  data: {
    name?: string;
    active?: boolean;
    phone?: string;
    addressLine1?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('delivery.manage');
    const supabase = createAdminClient();

    const { data: location, error: fetchErr } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (fetchErr || !location) {
      return { success: false, message: 'Pickup location not found' };
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updates.name = data.name;
    if (data.active !== undefined) updates.active = data.active;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.addressLine1 !== undefined) updates.address_line_1 = data.addressLine1;

    const { error: updateErr } = await supabase
      .from('pickup_locations')
      .update(updates)
      .eq('id', locationId);

    if (updateErr) {
      return { success: false, message: `Failed to update pickup location: ${updateErr.message}` };
    }

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'pickup_location.updated',
      targetType: 'pickup_location',
      targetId: locationId,
      before: location,
      after: updates,
    });

    revalidatePath('/admin/settings/delivery');

    return { success: true, message: `Pickup location "${location.name}" updated successfully` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// CRM / LEAD ACTIONS
// -----------------------------------------------------------------------------

/**
 * Update CRM Lead status and notes.
 */
export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string,
  notes?: string
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('users.manage');
    const supabase = createAdminClient();

    const { data: currentLead, error: fetchErr } = await supabase
      .from('leads')
      .select('id, status, notes, product_title')
      .eq('id', leadId)
      .single();

    if (fetchErr || !currentLead) {
      return { success: false, message: 'Lead not found in database' };
    }

    const { error: updateErr } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        notes: notes !== undefined ? notes : currentLead.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateErr) {
      return { success: false, message: `Failed to update lead: ${updateErr.message}` };
    }

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'lead.status_updated',
      targetType: 'lead',
      targetId: leadId,
      before: { status: currentLead.status },
      after: { status: newStatus, notes },
    });

    revalidatePath('/admin/leads');
    revalidatePath('/admin');

    return { success: true, message: `Lead updated to "${newStatus}"` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// DEVICE TRUST & ANTI-THEFT VERIFICATION ACTIONS
// -----------------------------------------------------------------------------

/**
 * Verify or update device trust record (IMEI, Serial, Activation Lock).
 */
export async function updateDeviceTrustAction(
  recordId: string,
  data: {
    trustLevel: 'seller_entered' | 'document_verified' | 'external_database_verified' | 'not_verified';
    activationLockStatus?: 'unlocked' | 'icloud_locked' | 'google_frp_locked' | 'knox_finance_locked' | 'network_sim_locked' | 'unknown';
    moderatorNotes?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('moderate.listings');
    const supabase = createAdminClient();

    const { data: record, error: fetchErr } = await supabase
      .from('device_trust_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchErr || !record) {
      return { success: false, message: 'Device trust record not found' };
    }

    const { error: updateErr } = await supabase
      .from('device_trust_records')
      .update({
        trust_level: data.trustLevel,
        activation_lock_status: data.activationLockStatus || record.activation_lock_status,
        moderator_notes: data.moderatorNotes || record.moderator_notes,
        verified_by: session.userId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (updateErr) {
      return { success: false, message: `Failed to update device trust: ${updateErr.message}` };
    }

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'device_trust.verified',
      targetType: 'device_trust_record',
      targetId: recordId,
      before: record,
      after: data,
    });

    revalidatePath('/admin/moderation');

    return { success: true, message: `Device trust record verified at level "${data.trustLevel}"` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

// -----------------------------------------------------------------------------
// COURIER DISPATCH ACTIONS
// -----------------------------------------------------------------------------

/**
 * Assign courier tracking number and partner for an order.
 */
export async function createCourierShipmentAction(
  orderId: string,
  data: {
    orderRef: string;
    courierPartner: 'g4s_kenya' | 'fargo_courier' | 'pickup_mtaani' | 'sendy' | 'direct_boda' | 'rider_direct' | 'matatu_courier' | 'manual';
    trackingNumber: string;
    recipientName: string;
    recipientPhone: string;
    recipientCounty: string;
    recipientAddress: string;
    shippingFeeKes?: number;
  }
): Promise<ActionResponse> {
  try {
    const session = await requirePermissionOrThrow('fulfillment.manage');
    const supabase = createAdminClient();

    const { data: shipment, error: insertErr } = await supabase
      .from('courier_shipments')
      .insert({
        order_id: orderId,
        order_ref: data.orderRef,
        courier_partner: data.courierPartner,
        tracking_number: data.trackingNumber,
        recipient_name: data.recipientName,
        recipient_phone: data.recipientPhone,
        recipient_county: data.recipientCounty,
        recipient_address: data.recipientAddress,
        shipping_fee_kes: data.shippingFeeKes || 0,
        status: 'picked_up',
        dispatched_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertErr) {
      return { success: false, message: `Failed to create shipment: ${insertErr.message}` };
    }

    // Update order status to dispatched
    await supabase
      .from('orders')
      .update({ status: 'dispatched', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    await logAdminAudit({
      actorUserId: session.userId,
      action: 'courier_shipment.created',
      targetType: 'order',
      targetId: orderId,
      before: { status: 'processing' },
      after: { status: 'dispatched', trackingNumber: data.trackingNumber, courier: data.courierPartner },
    });

    revalidatePath('/admin/fulfillment');
    revalidatePath('/admin/orders');

    return { success: true, message: `Shipment assigned via ${data.courierPartner} (Waybill: ${data.trackingNumber})` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authorization failed' };
  }
}

