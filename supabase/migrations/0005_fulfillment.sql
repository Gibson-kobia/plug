-- ============================================================================
-- TASK-007 · Migration 0005 · fulfillment
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- Scope (DATABASE_SCHEMA 0005 + TASK-007):
--   delivery_zones (Nairobi 8 + outskirts + nationwide; fee + ETA)
--   pickup_locations (lat/lng, hours JSONB, structured address)
--   FK closure: orders.delivery_zone_id / pickup_location_id (declared 0004)
-- ============================================================================

begin;

create table if not exists public.delivery_zones (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  kind           text not null default 'nairobi'
                 check (kind in ('nairobi','outskirts','nationwide')),
  fee_kes        numeric(12,2) not null default 0 check (fee_kes >= 0),
  eta_min_days   int not null default 0 check (eta_min_days >= 0),
  eta_max_days   int not null default 1 check (eta_max_days >= eta_min_days),
  active         boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index if not exists delivery_zones_active_idx on public.delivery_zones (active, sort_order);

-- Nairobi 8 zones (PRD §2.2.9 / TASK-007), plus outskirts + nationwide
insert into public.delivery_zones (name, slug, kind, fee_kes, eta_min_days, eta_max_days, sort_order) values
  ('CBD',         'cbd',         'nairobi',    150,  0, 1, 1),
  ('Westlands',   'westlands',   'nairobi',    200,  0, 1, 2),
  ('Kilimani',    'kilimani',    'nairobi',    200,  0, 1, 3),
  ('Kileleshwa',  'kileleshwa',  'nairobi',    200,  0, 1, 4),
  ('Eastleigh',   'eastleigh',   'nairobi',    200,  0, 1, 5),
  ('Karen',       'karen',       'nairobi',    250,  0, 1, 6),
  ('Thika Road',  'thika-road',  'nairobi',    250,  0, 1, 7),
  ('South B',     'south-b',     'nairobi',    200,  0, 1, 8),
  ('Nairobi Outskirts', 'nairobi-outskirts', 'outskirts', 350, 1, 1, 9),
  ('Nationwide',  'nationwide',  'nationwide', 600, 2, 5, 10)
on conflict (slug) do nothing;

create table if not exists public.pickup_locations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  county        text not null default 'Nairobi',
  area          text,
  address_line_1 text not null,
  map_place_id  text,
  lat           numeric(10,6) check (lat is null or lat between -90 and 90),
  lng           numeric(10,6) check (lng is null or lng between -180 and 180),
  operating_hours_jsonb jsonb not null default '{}'::jsonb,
  phone         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists pickup_locations_active_idx on public.pickup_locations (active);

insert into public.pickup_locations (name, county, area, address_line_1, lat, lng, operating_hours_jsonb, active)
-- reference seed; actual coordinates/locations to be confirmed by administrator
values ('Nairobi CBD Shop', 'Nairobi', 'CBD', 'Moi Avenue, Nairobi', 0, 0, '{}', true);
-- no conflict clause: table created empty in this migration, single intentional row

-- ---------------------------------------------------------------------------
-- FK closure: orders delivery_zone_id / pickup_location_id (declared 0004)
-- ---------------------------------------------------------------------------
do $$ begin
  alter table public.orders
    add constraint orders_delivery_zone_fk foreign key (delivery_zone_id)
    references public.delivery_zones (id) on delete restrict;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.orders
    add constraint orders_pickup_location_fk foreign key (pickup_location_id)
    references public.pickup_locations (id) on delete restrict;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.delivery_zones enable row level security;
alter table public.pickup_locations enable row level security;

-- public read only active (anon/authenticated)
create policy delivery_zones_read_public on public.delivery_zones for select
  using (active = true and deleted_at is null);
create policy pickup_locations_read_public on public.pickup_locations for select
  using (active = true and deleted_at is null);

commit;