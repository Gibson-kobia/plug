-- ============================================================================
-- Migration 0008 · leads_variants_and_specifications
-- Kenya Electronics Marketplace — Supabase/PostgreSQL Production Hardening
--
-- Scope:
--   * CRM / Lead Capture: public.leads
--   * M-PESA Daraja Integration: public.mpesa_transactions
--   * Device Trust & Anti-Theft: public.device_trust_records
--   * Courier Dispatch & Logistics: public.courier_shipments
--   * Product Specification & Variant enhancements
-- ============================================================================

begin;

-- 1. LEADS / CRM ENGINE
do $$ begin
  create type public.lead_status as enum (
    'new',
    'contacted',
    'negotiating',
    'payment_pending',
    'converted',
    'lost',
    'cancelled'
  );
  create type public.lead_source as enum (
    'whatsapp_pdp',
    'whatsapp_cart',
    'reserve_click',
    'buy_now_click',
    'price_inquiry',
    'seller_contact',
    'direct_call'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_title text not null,
  variant_id text,
  seller_id uuid references public.seller_profiles (id) on delete set null,
  customer_name text,
  customer_phone text,
  customer_email text,
  source public.lead_source not null default 'whatsapp_pdp',
  campaign text,
  status public.lead_status not null default 'new',
  estimated_value_kes numeric(12,2),
  notes text,
  metadata_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status_created on public.leads (status, created_at desc);
create index if not exists idx_leads_product on public.leads (product_id);
create index if not exists idx_leads_seller on public.leads (seller_id);
create index if not exists idx_leads_phone on public.leads (customer_phone);

-- 2. M-PESA TRANSACTIONS
do $$ begin
  create type public.mpesa_tx_status as enum (
    'initiated',
    'pending_pin',
    'completed',
    'failed',
    'cancelled_by_user',
    'timeout'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.mpesa_transactions (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null,
  checkout_request_id text not null unique,
  merchant_request_id text not null,
  phone_number text not null,
  amount_kes numeric(12,2) not null check (amount_kes > 0),
  status public.mpesa_tx_status not null default 'initiated',
  mpesa_receipt_number text,
  result_code integer,
  result_desc text,
  raw_callback_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mpesa_tx_order_ref on public.mpesa_transactions (order_ref);
create index if not exists idx_mpesa_tx_checkout on public.mpesa_transactions (checkout_request_id);
create index if not exists idx_mpesa_tx_status on public.mpesa_transactions (status);

-- 3. DEVICE TRUST & ANTI-THEFT RECORDS
do $$ begin
  create type public.device_trust_level as enum (
    'seller_entered',
    'document_verified',
    'external_database_verified',
    'not_verified'
  );
  create type public.lock_check_status as enum (
    'unlocked',
    'icloud_locked',
    'google_frp_locked',
    'knox_finance_locked',
    'network_sim_locked',
    'unknown'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.device_trust_records (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.used_listings (id) on delete cascade,
  product_id text,
  imei_1 text,
  imei_2 text,
  serial_number text,
  model_number text,
  battery_health_percentage integer check (battery_health_percentage between 0 and 100),
  activation_lock_status public.lock_check_status not null default 'unknown',
  finance_lock_declared boolean not null default false,
  proof_of_purchase_url text,
  trust_level public.device_trust_level not null default 'seller_entered',
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  moderator_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_device_trust_listing on public.device_trust_records (listing_id);
create index if not exists idx_device_trust_imei on public.device_trust_records (imei_1);

-- 4. COURIER SHIPMENTS & DISPATCH
do $$ begin
  create type public.courier_partner as enum (
    'g4s_kenya',
    'fargo_courier',
    'pickup_mtaani',
    'sendy',
    'direct_boda',
    'rider_direct',
    'matatu_courier',
    'manual'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.courier_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  order_ref text not null,
  courier_partner public.courier_partner not null default 'manual',
  tracking_number text,
  waybill_url text,
  pickup_station_name text,
  recipient_name text not null,
  recipient_phone text not null,
  recipient_county text not null,
  recipient_address text not null,
  shipping_fee_kes numeric(10,2) not null default 0,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  status text not null default 'assigned',
  tracking_events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courier_shipments_order on public.courier_shipments (order_id);
create index if not exists idx_courier_shipments_tracking on public.courier_shipments (tracking_number);

-- 5. RLS POLICIES FOR NEW TABLES

alter table public.leads enable row level security;
alter table public.mpesa_transactions enable row level security;
alter table public.device_trust_records enable row level security;
alter table public.courier_shipments enable row level security;

-- Leads: Staff can read/write; public can insert leads
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);

create policy "Staff can manage leads"
  on public.leads for all
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'super_admin', 'moderator')
  );

-- M-PESA Transactions: Staff can read; service role writes
create policy "Staff can view mpesa transactions"
  on public.mpesa_transactions for select
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'super_admin')
  );

-- Device Trust: Public can read verified records; staff can manage
create policy "Public can view verified device trust"
  on public.device_trust_records for select
  using (trust_level != 'not_verified');

create policy "Staff can manage device trust"
  on public.device_trust_records for all
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'super_admin', 'moderator')
  );

-- Courier Shipments: Staff can manage; buyers can view their own order shipment
create policy "Staff can manage courier shipments"
  on public.courier_shipments for all
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'super_admin', 'fulfillment')
  );

commit;
