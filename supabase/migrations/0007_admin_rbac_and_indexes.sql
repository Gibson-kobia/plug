-- ============================================================================
-- TASK-111 · Migration 0007 · admin_rbac_and_indexes
-- Kenya Electronics Marketplace — Admin Control Center Support
--
-- Scope:
--   * Register 'fulfillment' staff role into public.roles
--   * Add performance indexes for admin queue queries
--   * Add RLS policies for staff access across orders, moderation, KYC & audit
-- ============================================================================

begin;

-- 1. Register Fulfillment role
insert into public.roles (name, slug, description) values
  ('Fulfillment Specialist', 'fulfillment', 'Operational staff — manages packaging, dispatch, courier assignments, and delivery status')
on conflict (slug) do nothing;

-- 2. Performance indexes for admin queries
create index if not exists idx_used_listings_moderation_status 
  on public.used_listings (moderation_status, created_at desc);

create index if not exists idx_seller_profiles_kyc_status 
  on public.seller_profiles (kyc_status, created_at desc);

create index if not exists idx_orders_status_created 
  on public.orders (status, created_at desc);

create index if not exists idx_order_fulfillments_status 
  on public.order_fulfillments (status, created_at desc);

create index if not exists idx_audit_logs_action_created 
  on public.audit_logs (action, created_at desc);

create index if not exists idx_audit_logs_actor 
  on public.audit_logs (actor_user_id, created_at desc);

-- 3. Staff read-access policy for audit_logs
drop policy if exists "Staff can view audit logs" on public.audit_logs;
create policy "Staff can view audit logs"
  on public.audit_logs for select
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'super_admin')
  );

commit;
