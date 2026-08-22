-- ============================================================================
-- TASK-006 · Migration 0004 · orders_stock_finance
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- Scope (DATABASE_SCHEMA 0004 + TASK-006 + Tech-Arch §6):
--   CART: carts, cart_items
--   RESERVATION: reservations + release_expired_reservations_for() + sweepers
--   STOCK: reserve_variant() (FOR UPDATE SKIP LOCKED) + inventory_transactions
--   FINANCE: commission_rules, seller_ledger_entries, coupons, coupon_redemptions
--   ORDERS: orders + order_items + sign_order_ref() HMAC, fulfillment groups/
--           fulfillments, order_events FSM, disputes, cancellations, returns,
--           refunds, order_payments
--   closes reviews.order_item_id FK (table created in 0002)
--
-- Dependency notes:
--   orders.delivery_zone_id / pickup_location_id FK added in 0005 (tables live
--   there). inventory_transactions.order_id FK to orders created below.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- CART
-- ---------------------------------------------------------------------------
create table if not exists public.carts (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid,
  user_id    uuid references auth.users (id) on delete cascade,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner_ck check (session_id is not null or user_id is not null)
);

create unique index if not exists carts_session_uq on public.carts (session_id) where session_id is not null;
create unique index if not exists carts_user_uq on public.carts (user_id) where user_id is not null;
create index if not exists carts_session_idx on public.carts (session_id);

create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  cart_id    uuid not null references public.carts (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete restrict,
  listing_id uuid references public.used_listings (id) on delete restrict,
  qty        integer not null default 1 check (qty between 1 and 50),
  reserved   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_target_ck check
    (variant_id is not null or listing_id is not null),
  constraint cart_items_qty_ck check (qty >= 1 and qty <= 50)
);

create index if not exists cart_items_cart_idx on public.cart_items (cart_id);

do $$ begin
  create type public.reservation_status as enum
    ('active','converted','released','expired','cancelled');
  create type public.reservation_product_type as enum ('new','used');
exception when duplicate_object then null; end $$;

create table if not exists public.reservations (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null,
  user_id        uuid references auth.users (id) on delete set null,
  product_type   public.reservation_product_type not null default 'new',
  product_id     uuid references public.products (id) on delete restrict,
  variant_id     uuid references public.product_variants (id) on delete restrict,
  listing_id     uuid references public.used_listings (id) on delete restrict,
  qty            integer not null default 1 check (qty > 0),
  status         public.reservation_status not null default 'active',
  expires_at     timestamptz not null,
  extension_count integer not null default 0 check (extension_count between 0 and 1),
  released_at    timestamptz,
  created_at     timestamptz not null default now(),
  constraint reservations_target_ck check
    (product_type = 'used' and listing_id is not null
     or product_type = 'new' and variant_id is not null)
);

create index if not exists reservations_active_expiry_idx
  on public.reservations (expires_at) where status = 'active';
create index if not exists reservations_session_idx on public.reservations (session_id);
-- idempotency guard (KNOWN_ISSUES M-02): one active reservation per session+variant
create unique index if not exists reservations_active_session_variant_uq
  on public.reservations (session_id, variant_id) where status = 'active';
create unique index if not exists reservations_active_session_listing_uq
  on public.reservations (session_id, listing_id)
  where status = 'active' and listing_id is not null;

do $$ begin
  create type public.inventory_reason as enum
    ('purchase','reserve_hold','reserve_release','restock','damaged','shrinkage',
     'returned','sold','audit_adjust');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- ORDERS (created before inventory_transactions to satisfy its order FK)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.order_status as enum
    ('pending_whatsapp','customer_contacted','confirmed','processing',
     'out_for_delivery','ready_for_pickup','delivered','cancelled','refunded');
  create type public.payment_method as enum
    ('mpesa','cash_on_delivery','bank_transfer','wallet','check_later','wa_agreed_no_pay_yet');
  create type public.payment_status as enum ('pending','success','failed','reversed');
  create type public.refund_status as enum ('requested','processing','completed','failed');
  create type public.dispute_status as enum
    ('open','investigating','resolved_refund','resolved_partial','resolved_kept',
     'dismissed','appealed');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  ref               text unique,
  ref_sig           text,
  buyer_user_id     uuid references auth.users (id) on delete set null,
  session_id        uuid,
  customer_name     text not null,
  customer_phone    text not null check (customer_phone ~ '^(\+254|0)?(1[01]\d{7}|[7]\d{8})$'),
  customer_email    text,
  status            public.order_status not null default 'pending_whatsapp',
  mode              text not null check (mode in ('delivery','pickup')),
  delivery_zone_id  uuid,
  pickup_location_id uuid,
  coupon_code       text,
  notes             text,
  attribution       jsonb not null default '{}'::jsonb,
  total_kes         numeric(12,2) not null default 0 check (total_kes >= 0),
  ttl_until         timestamptz not null default (now() + interval '15 minutes'),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_status_ttl_idx on public.orders (status, ttl_until);
create index if not exists orders_user_idx on public.orders (buyer_user_id);
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- sign_order_ref(): HMAC-SHA256 8-char signature (Tech-Arch §6.2.6)
create or replace function public.sign_order_ref(p_order_id uuid)
returns table (ref_text text, sig text) language plpgsql as $$
declare
  v_key text := coalesce(current_setting('app.hmac_key', true), 'dev-fallback-change-me');
  v_ref text;
  v_sig text;
begin
  select format('ELEC-%s-%s', to_char(now(), 'YYMM'), upper(substr(p_order_id::text,1,4)))
    into v_ref;
  v_sig := upper(substr(encode(hmac(v_ref::bytea, v_key::bytea, 'sha256'), 'hex'), 1, 8));
  return query select v_ref, v_sig;
end;
$$;

create table if not exists public.order_fulfillment_groups (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  owner_type       text not null check (owner_type in ('platform','seller')),
  owner_id         uuid,
  whatsapp_target  text not null,
  sub_total_kes    numeric(12,2) not null default 0 check (sub_total_kes >= 0),
  delivery_fee_kes numeric(12,2) not null default 0 check (delivery_fee_kes >= 0),
  status           public.order_status not null default 'pending_whatsapp',
  tracking_summary text,
  created_at       timestamptz not null default now()
);
create index if not exists groups_order_idx on public.order_fulfillment_groups (order_id);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  group_id      uuid references public.order_fulfillment_groups (id) on delete set null,
  variant_id    uuid references public.product_variants (id) on delete restrict,
  listing_id    uuid references public.used_listings (id) on delete restrict,
  unit_price_kes numeric(12,2) not null check (unit_price_kes >= 0),
  qty           integer not null default 1 check (qty > 0),
  line_total_kes numeric(12,2) not null check (line_total_kes >= 0),
  constraint order_items_target_ck check
    (variant_id is not null or listing_id is not null)
);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_group_idx on public.order_items (group_id);

create table if not exists public.order_fulfillments (
  id                          uuid primary key default gen_random_uuid(),
  group_id                    uuid not null references public.order_fulfillment_groups (id) on delete cascade,
  partner_name                text,
  tracking_no                 text,
  driver_name                 text,
  driver_phone                text,
  status                      text not null default 'assigned'
    check (status in ('assigned','picked_up','in_transit','out_for_delivery',
                      'delivered','failed_attempt','returned')),
  proof_of_delivery_photo_url text,
  signature_url               text,
  notes                       text,
  estimated_delivery_at       timestamptz,
  delivered_at                timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists fulfillments_group_idx on public.order_fulfillments (group_id);

create table if not exists public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  group_id    uuid references public.order_fulfillment_groups (id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  actor_type  text not null default 'system'
              check (actor_type in ('system','cron','user','agent','admin','seller')),
  actor_id    uuid references auth.users (id) on delete set null,
  reason      text,
  metadata    jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, occurred_at desc);

create table if not exists public.disputes (
  id                uuid primary key default gen_random_uuid(),
  dispute_no        text not null unique,
  raised_by_user_id uuid not null references auth.users (id) on delete restrict,
  order_id          uuid references public.orders (id) on delete set null,
  reason            text not null,
  description       text,
  evidence_urls     text[] not null default '{}',
  status            public.dispute_status not null default 'open',
  awarded_amount_kes numeric(12,2) check (awarded_amount_kes is null or awarded_amount_kes >= 0),
  resolver_id       uuid references auth.users (id) on delete set null,
  resolution_notes  text,
  created_at        timestamptz not null default now(),
  resolved_at       timestamptz
);

create table if not exists public.order_cancellations (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  requested_by   uuid references auth.users (id) on delete set null,
  reason         text,
  stock_restored boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists public.return_requests (
  id             uuid primary key default gen_random_uuid(),
  order_item_id  uuid not null references public.order_items (id) on delete restrict,
  reason         text not null,
  status         text not null default 'requested'
                 check (status in ('requested','approved','received','rejected')),
  created_at     timestamptz not null default now()
);

create table if not exists public.refunds (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  amount_kes   numeric(12,2) not null check (amount_kes > 0),
  method       text not null default 'mpesa',
  status       public.refund_status not null default 'requested',
  provider_ref text,
  initiated_by uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.order_payments (
  id                      uuid primary key default gen_random_uuid(),
  order_id                uuid not null references public.orders (id) on delete cascade,
  method                  public.payment_method not null,
  amount_kes              numeric(12,2) not null check (amount_kes > 0),
  provider_ref            text,
  provider_transaction_id text,
  status                  public.payment_status not null default 'pending',
  received_at             timestamptz,
  created_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- inventory_transactions (FK order_id above satisfied)
-- ---------------------------------------------------------------------------
create table if not exists public.inventory_transactions (
  id             uuid primary key default gen_random_uuid(),
  variant_id     uuid references public.product_variants (id) on delete restrict,
  listing_id     uuid references public.used_listings (id) on delete restrict,
  reason         public.inventory_reason not null,
  qty_delta      integer not null check (qty_delta <> 0),
  actor_id       uuid references auth.users (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  order_id       uuid references public.orders (id) on delete set null,
  occurred_at    timestamptz not null default now(),
  note           text
);
create index if not exists inventory_tx_variant_idx
  on public.inventory_transactions (variant_id, occurred_at);

-- ---------------------------------------------------------------------------
-- release_expired_reservations_for()
--   p_variant_id null → sweep ALL expired reservations (cron use).
--   Idempotent: flips status 'active'→'expired' then restores stock/ledger.
-- ---------------------------------------------------------------------------
create or replace function public.release_expired_reservations_for(p_variant_id uuid)
returns integer language plpgsql as $$
declare
  v_count integer;
begin
  with expired as (
    update public.reservations r
       set status = 'expired', released_at = now()
     where r.status = 'active'
       and r.expires_at <= now()
       and (p_variant_id is null or r.variant_id = p_variant_id)
     returning r.id, r.variant_id, r.qty
  ),
  agg as (
    select variant_id, sum(qty) as qty from expired where variant_id is not null group by variant_id
  ),
  restore as (
    update public.product_variants pv
       set stock = pv.stock + agg.qty
      from agg
     where pv.id = agg.variant_id
     returning pv.id
  ),
  log as (
    insert into public.inventory_transactions (variant_id, reason, qty_delta, reservation_id, note)
      select e.variant_id, 'reserve_release', e.qty, e.id, 'system:expiry-sweep'
        from expired e
      where e.variant_id is not null
  )
  select count(*) into v_count from expired;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- reserve_variant() — atomic stock integrity
-- DB-level proof:  concurrent calls on last unit → exactly one succeeds,
-- never negative stock, ledger sums == stock (DATABASE_ACCEPTANCE §RES)
-- ---------------------------------------------------------------------------
create or replace function public.reserve_variant(
  p_variant_id uuid,
  p_qty integer,
  p_session_id uuid,
  p_user_id uuid default null,
  p_ttl_minutes integer default 20
) returns table (ok boolean, reservation_id uuid, expires_at timestamptz, new_stock bigint)
language plpgsql as $$
declare
  v_stock  bigint;
  v_res    uuid;
  v_exp    timestamptz;
  v_qty    integer := coalesce(p_qty, 1);
  i        integer;
begin
  if v_qty < 1 then raise exception 'INVALID_QTY'; end if;
  if v_qty > 200 then raise exception 'RESERVATION_LIMIT_EXCEEDED'; end if;

  -- close race window: expire any prior active holds for this variant first
  perform public.release_expired_reservations_for(p_variant_id);

  -- FOR UPDATE SKIP LOCKED avoids blocking on unrelated hold-locks; if the row
  -- is currently locked by another transaction, briefly retry instead of
  -- wrongly reporting OUT_OF_STOCK (keeps concurrent multi-unit correctness).
  for i in 1..50 loop
    select stock into v_stock from public.product_variants
     where id = p_variant_id for update skip locked;
    exit when v_stock is not null;
    perform pg_sleep(0.01);
  end loop;

  if v_stock is null then raise exception 'OUT_OF_STOCK'; end if;
  if v_stock < v_qty then raise exception 'OUT_OF_STOCK'; end if;

  update public.product_variants set stock = stock - v_qty
   where id = p_variant_id returning stock into v_stock;

  v_exp := now() + make_interval(mins => p_ttl_minutes);
  insert into public.reservations
    (session_id, user_id, product_type, product_id, variant_id, qty, status, expires_at)
  values
    (p_session_id, p_user_id, 'new',
     (select product_id from public.product_variants where id = p_variant_id),
     p_variant_id, v_qty, 'active', v_exp)
  returning id into v_res;

  insert into public.inventory_transactions (variant_id, reason, qty_delta, actor_id, reservation_id)
  values (p_variant_id, 'reserve_hold', -v_qty, p_user_id, v_res);

  return query select true, v_res, v_exp, v_stock;
end;
$$;

-- ---------------------------------------------------------------------------
-- FINANCE
-- ---------------------------------------------------------------------------
create table if not exists public.commission_rules (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid references public.categories (id) on delete restrict,
  seller_tier        text not null default 'standard'
                     check (seller_tier in ('standard','verified','power')),
  commission_percent numeric(5,2) not null default 8.00 check (commission_percent between 0 and 100),
  min_commission_kes numeric(12,2) check (min_commission_kes is null or min_commission_kes >= 0),
  max_commission_kes numeric(12,2) check (max_commission_kes is null or max_commission_kes >= 0),
  effective_from     timestamptz not null default now()
);
create index if not exists commission_rules_idx on public.commission_rules (category_id, seller_tier);

create table if not exists public.seller_ledger_entries (
  id                  uuid primary key default gen_random_uuid(),
  seller_id           uuid not null references public.seller_profiles (id) on delete restrict,
  order_id            uuid references public.orders (id) on delete set null,
  order_group_id      uuid references public.order_fulfillment_groups (id) on delete set null,
  dispute_id          uuid references public.disputes (id) on delete set null,
  kind                text not null check (kind in ('sale','commission','refund','payout','adjustment')),
  amount_kes          numeric(12,2) not null check (amount_kes <> 0),
  balance_after_kes   numeric(14,2) not null,
  reference           text not null,
  created_at          timestamptz not null default now()
);
create index if not exists ledger_seller_idx on public.seller_ledger_entries (seller_id, created_at desc);

do $$ begin
  create type public.coupon_discount_type as enum ('percent','fixed_kes');
  create type public.coupon_scope_type as enum ('global','category','product','seller');
exception when duplicate_object then null; end $$;

create table if not exists public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  display_name     text not null,
  discount_type    public.coupon_discount_type not null,
  discount_value   numeric(12,2) not null check (discount_value > 0),
  min_cart_kes     numeric(12,2) check (min_cart_kes is null or min_cart_kes >= 0),
  max_discount_kes numeric(12,2) check (max_discount_kes is null or max_discount_kes >= 0),
  max_uses_total   integer check (max_uses_total is null or max_uses_total >= 0),
  uses_per_user    integer check (uses_per_user is null or uses_per_user >= 0),
  scope_type       public.coupon_scope_type not null default 'global',
  scope_ids        uuid[] not null default '{}',
  stackable        boolean not null default false,
  starts_at        timestamptz not null default now(),
  expires_at       timestamptz,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger coupons_touch_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

create table if not exists public.coupon_redemptions (
  id                 uuid primary key default gen_random_uuid(),
  coupon_id          uuid not null references public.coupons (id) on delete restrict,
  user_id            uuid references auth.users (id) on delete set null,
  order_id           uuid not null references public.orders (id) on delete cascade,
  discount_applied   numeric(12,2) not null check (discount_applied >= 0),
  redeemed_at        timestamptz not null default now(),
  constraint coupon_redemptions_uq unique (coupon_id, order_id)
);

-- ---------------------------------------------------------------------------
-- reviews FK closure (order_item_id created in 0002)
-- ---------------------------------------------------------------------------
do $$ begin
  alter table public.reviews
    add constraint reviews_order_item_fk foreign key (order_item_id)
    references public.order_items (id) on delete restrict;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Sweeper SP for orders (order_sweeper cron job registered in 0006)
-- Cancels orders stuck in pending_whatsapp past TTL, restores stock, logs events.
-- Idempotent: only touches status='pending_whatsapp' and flips to 'cancelled'.
-- Implementation uses a temp table because the cancelled set is needed across
-- several statements (a CTE is scoped to a single statement).
-- ---------------------------------------------------------------------------
create or replace function public.expire_pending_whatsapp_orders()
returns integer language plpgsql as $$
declare
  v_count integer := 0;
begin
  create temp table if not exists _cancelled_orders (id uuid) on commit drop;
  truncate _cancelled_orders;

  insert into _cancelled_orders (id)
  select o.id from public.orders o
   where o.status = 'pending_whatsapp'
     and o.ttl_until < now()
     for update skip locked;

  get diagnostics v_count = row_count;
  if v_count > 0 then
    update public.orders o set status = 'cancelled', updated_at = now()
      where o.id in (select id from _cancelled_orders);

    update public.product_variants pv
       set stock = pv.stock + oi.qty
      from public.order_items oi
      join _cancelled_orders cc on cc.id = oi.order_id
     where oi.variant_id = pv.id;

    insert into public.inventory_transactions (variant_id, reason, qty_delta, order_id, note)
      select oi.variant_id, 'reserve_release', oi.qty, oi.order_id, 'order-ttl-expired'
        from public.order_items oi
        join _cancelled_orders cc on cc.id = oi.order_id
       where oi.variant_id is not null;

    insert into public.order_events (order_id, from_status, to_status, actor_type, reason)
      select cc.id, 'pending_whatsapp', 'cancelled', 'cron', 'ttl-15-min-expired'
        from _cancelled_orders cc;

    update public.order_fulfillment_groups g
       set status = 'cancelled'
      from _cancelled_orders cc
     where g.order_id = cc.id and g.status = 'pending_whatsapp';
  end if;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS visibility (final controls in 0006)
-- ---------------------------------------------------------------------------
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.reservations enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_fulfillment_groups enable row level security;
alter table public.order_fulfillments enable row level security;
alter table public.order_events enable row level security;
alter table public.disputes enable row level security;
alter table public.order_cancellations enable row level security;
alter table public.return_requests enable row level security;
alter table public.refunds enable row level security;
alter table public.order_payments enable row level security;
alter table public.commission_rules enable row level security;
alter table public.seller_ledger_entries enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

commit;