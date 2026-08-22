-- ============================================================================
-- TASK-004 · Migration 0002 · catalog_core
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- Scope (DATABASE_SCHEMA 0002 + TASK-004 + CATALOGUE_MASTER + Tech-Arch §6):
--   categories (parent_id tree + product_count trigger)
--   brands, products, product_variants (UNIQUE SKU), product_images, price_history
--   mv_search_index (GIN tsvector + gin_trgm_ops, refresh CONCURRENTLY)
--   Sheng/Swahili search synonyms (table-driven; see note)
--   spec_templates + spec_values (JSONB)   [resolves KNOWN_ISSUES C-04]
--   product_alerts, reviews (FK order_item_id NOT NULL)
--   homepage_sections + homepage_section_items
--
-- NOTE on search synonyms (KNOWN_ISSUES P-01 / env):
--   CATALOGUE §10 specifies a filesystem thesaurus (.ths + custom ts_config).
--   Supabase hosted Postgres does NOT allow creating dictionary FILES, so this
--   migration implements the synonym dictionary as a queryable table +
--   a simple text-search config. Application query-builder expands canonical
--   terms via the table (same business meaning as the thesaurus).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- categories (parent_id tree)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references public.categories (id) on delete restrict,
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  sort_order    int not null default 0,
  product_count int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_sort_idx on public.categories (sort_order);

create trigger categories_touch_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  logo_url   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger brands_touch_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- product status enum (CATALOGUE §11)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.product_status_enum as enum (
    'draft','draft_review','scheduled','published',
    'published_out_of_stock_hidden','unpublished_manual','discontinued',
    'recalled_safety','deleted_soft'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid not null references public.categories (id) on delete restrict,
  brand_id            uuid not null references public.brands (id) on delete restrict,
  seller_id           uuid references auth.users (id) on delete restrict, -- null = platform
  slug                text not null unique,
  title               text not null,
  seo_title           text,
  seo_description     text,
  summary             text,
  description_markdown text,
  base_price_kes      numeric(12,2) not null check (base_price_kes >= 0),
  compare_at_price_kes numeric(12,2) check (compare_at_price_kes is null or compare_at_price_kes >= 0),
  currency            text not null default 'KES',
  warranty_months_default int not null default 12,
  status              public.product_status_enum not null default 'draft',
  published_at        timestamptz,
  unpublished_reason_jsonb jsonb,
  search_tsv          tsvector,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_status_partial_idx
  on public.products (id) where status = 'published' and deleted_at is null;
create index if not exists products_tsv_idx on public.products using gin (search_tsv);

-- category product_count denormalized trigger (Tech-Arch §6.4.4)
create or replace function public.sync_category_product_count()
returns trigger language plpgsql as $$
begin
  update public.categories c
     set product_count = (
           select count(*) from public.products p
            where p.category_id = c.id
              and p.status = 'published'
              and p.deleted_at is null)
   where c.id = coalesce(new.category_id, old.category_id);
  return coalesce(new, old);
end;
$$;

create trigger products_sync_category_count
  after insert or update of category_id, status, deleted_at or delete on public.products
  for each row execute function public.sync_category_product_count();

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_variants (UNIQUE SKU, attributes JSONB, stock >= 0)
-- ---------------------------------------------------------------------------
create table if not exists public.product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products (id) on delete restrict,
  sku                 text not null unique,
  attributes_jsonb    jsonb not null default '{}'::jsonb,
  price_delta_kes     numeric(12,2) not null default 0 check (price_delta_kes >= 0),
  compare_at_price_kes numeric(12,2),
  stock               int not null default 0 check (stock >= 0),
  weight_grams        int check (weight_grams is null or weight_grams > 0),
  gtin_ean_upc        text,
  mpn                 text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists product_variants_stock_idx
  on public.product_variants (product_id, stock) where is_active and deleted_at is null;

create trigger variants_touch_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_images  (10 admin slots per CATALOGUE §08 + sort/alt)
-- ---------------------------------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  variant_id  uuid references public.product_variants (id) on delete cascade,
  url         text not null,
  kind        text not null default 'front'
              check (kind in ('front','back','left','right','top','bottom',
                              'box','accessories','lifestyle','video','other')),
  alt_text    text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- price_history
-- ---------------------------------------------------------------------------
create table if not exists public.price_history (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references public.products (id) on delete cascade,
  variant_id    uuid references public.product_variants (id) on delete cascade,
  old_price_kes numeric(12,2),
  new_price_kes numeric(12,2) not null,
  effective_at  timestamptz not null default now(),
  reason        text,
  actor_id      uuid references auth.users (id) on delete set null
);

create index if not exists price_history_product_idx on public.price_history (product_id, effective_at desc);

-- ---------------------------------------------------------------------------
-- spec_templates + spec_values (resolves KNOWN_ISSUES C-04)
-- ---------------------------------------------------------------------------
create table if not exists public.spec_templates (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete restrict,
  key          text not null,
  label        text not null,
  value_type   text not null default 'string'
               check (value_type in ('string','number','boolean','enum_string','array_string')),
  unit         text,
  enum_options jsonb,
  filterable   boolean not null default false,
  highlighted  boolean not null default false,
  sort_order   int not null default 0,
  unique (category_id, key)
);

create table if not exists public.spec_values (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  template_id   uuid not null references public.spec_templates (id) on delete cascade,
  value         jsonb not null,
  unique (product_id, template_id)
);

-- ---------------------------------------------------------------------------
-- product_alerts (price-drop threshold + back-in-stock)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.alert_kind_enum as enum ('price_drop','back_in_stock');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.alert_channel_enum as enum ('sms','whatsapp','in_app');
exception when duplicate_object then null; end $$;

create table if not exists public.product_alerts (
  id               uuid primary key default gen_random_uuid(),
  kind             public.alert_kind_enum not null,
  user_id          uuid references auth.users (id) on delete cascade,
  anonymous_phone  text,
  product_id       uuid references public.products (id) on delete cascade,
  variant_id       uuid references public.product_variants (id) on delete cascade,
  threshold_kes    numeric(12,2) check (threshold_kes is null or threshold_kes >= 0),
  channel          public.alert_channel_enum not null default 'whatsapp',
  active           boolean not null default true,
  triggered_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists product_alerts_active_idx
  on public.product_alerts (kind, active) where active;
create index if not exists product_alerts_variant_idx on public.product_alerts (variant_id);

-- ---------------------------------------------------------------------------
-- reviews  (verified-purchase FK: order_item_id NOT NULL — final gate in 0004)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.review_status_enum as enum ('published','hidden','reported');
exception when duplicate_object then null; end $$;

create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  reviewable_type text not null check (reviewable_type in ('product','listing','seller')),
  reviewable_id   uuid not null,
  reviewer_id     uuid not null references auth.users (id) on delete restrict,
  order_item_id   uuid not null unique, -- FK to order_items added in 0004
  rating          int not null check (rating between 1 and 5),
  title           text,
  body            text,
  images          text[],
  helpful_votes   int not null default 0,
  verified_purchase boolean not null default false,
  status          public.review_status_enum not null default 'published',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists reviews_reviewable_idx on public.reviews (reviewable_type, reviewable_id);
create index if not exists reviews_reviewer_idx on public.reviews (reviewer_id);

create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- homepage_sections + items
-- ---------------------------------------------------------------------------
create table if not exists public.homepage_sections (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  kind         text not null,
  title        text,
  subtitle     text,
  layout_jsonb jsonb not null default '{}'::jsonb,
  sort_order   int not null default 0,
  starts_at    timestamptz,
  expires_at   timestamptz,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.homepage_section_items (
  id             uuid primary key default gen_random_uuid(),
  section_id     uuid not null references public.homepage_sections (id) on delete cascade,
  reference_type text not null check (reference_type in
                 ('product','listing','banner','category','brand','custom_url')),
  reference_id   uuid,
  custom_url     text,
  title          text,
  subtitle       text,
  image_url      text,
  sort_order     int not null default 0,
  expires_at     timestamptz
);

create index if not exists homepage_items_section_idx
  on public.homepage_section_items (section_id, sort_order);

-- ---------------------------------------------------------------------------
-- search synonyms (Sheng/Swahili — table-driven; see header note)
-- ---------------------------------------------------------------------------
create table if not exists public.search_synonyms (
  canonical_term text primary key,
  synonyms       text[] not null,
  directional    boolean not null default false, -- true = canonical → synonyms only
  created_at     timestamptz not null default now()
);

-- Core seed synonyms (CATALOGUE §10 — representative subset; admin may extend)
insert into public.search_synonyms (canonical_term, synonyms, directional) values
  ('iphone', array['apple phone','i phone','iphones'], false),
  ('earbuds', array['buds','ear pods','airpods','earphones','true wireless','tws'], false),
  ('flash_drive', array['flash','pendrive','pen drive','usb flash','thumb drive'], false),
  ('television', array['tv','tvs','televisheni'], false),
  ('laptop', array['lappy','lap top','notebook','kompyuta'], false),
  ('desktop', array['pc','desktop pc','tower pc'], false),
  ('charger', array['adapter','power adapter','charge head','fast charger'], false),
  ('usb_c', array['type c','usb-c','type-c','usbc'], false),
  ('powerbank', array['power bank','portable charger','back up battery'], false),
  ('sim_router', array['4g router','5g router','mifi','pocket wifi'], false),
  ('ssd', array['solid state drive','nvme','m.2','ssd drive'], false),
  ('hdd', array['hard drive','hard disk','internal hdd'], false),
  ('monitor', array['screen','display','pc screen'], false),
  ('smart_watch', array['smartwatch','smart watch'], false),
  ('simu', array['phone','smartphone'], true),
  ('simu_ya_mkwanjani', array['used phone','second hand phone'], true),
  ('mpya', array['new'], true),
  ('bei_nzuri', array['cheap','low price'], true),
  ('tecno', array['tecno mobile','techno','tecno spark','tecno camon'], false),
  ('samsung', array['sam','sumsung','sansung','galaxy'], false),
  ('infinix', array['infinix zero','infinix hot','infinix note'], false),
  ('redmi', array['redmi note','xiaomi redmi'], false),
  ('poco', array['poco m','poco x','poco f'], false),
  ('oraimo', array['oraimo pods','oraimo earbuds','oraimo freebuds','oraimo power bank'], false),
  ('ugreen', array['ugreen cable','ugreen charger','ugreen hub'], false),
  ('fast_charge', array['quick charge','qc 3.0','vooc','dash','usb pd','power delivery','pps'], false),
  ('magsafe', array['magnetic charging','mag safe','iphone magnetic'], false)
on conflict (canonical_term) do nothing;

-- ---------------------------------------------------------------------------
-- mv_search_index (GIN tsvector + gin_trgm_ops; refresh CONCURRENTLY job in 0006)
-- ---------------------------------------------------------------------------
create materialized view if not exists public.mv_search_index as
  select p.id,
         p.slug,
         p.title,
         p.summary,
         p.search_tsv,
         p.status,
         p.deleted_at,
         c.name as category_name,
         b.name as brand_name
    from public.products p
    join public.categories c on c.id = p.category_id
    join public.brands b on b.id = p.brand_id
  with no data;

create unique index if not exists mv_search_index_id_idx on public.mv_search_index (id);
create index if not exists mv_search_index_tsv_idx
  on public.mv_search_index using gin (search_tsv);
create index if not exists mv_search_index_trgm_idx
  on public.mv_search_index using gin (title gin_trgm_ops);

-- populate on first run. NOTE: CONCURRENTLY cannot run inside a transaction
-- block, so the initial fill uses plain refresh; the 15-min cron refresh in
-- 0006 uses CONCURRENTLY (runs outside a migration tx).
refresh materialized view public.mv_search_index;

-- ---------------------------------------------------------------------------
-- RLS — seed policies for catalog (expanded in 0006)
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.price_history enable row level security;
alter table public.spec_templates enable row level security;
alter table public.spec_values enable row level security;
alter table public.product_alerts enable row level security;
alter table public.reviews enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.homepage_section_items enable row level security;
alter table public.search_synonyms enable row level security;

-- buyer-visible (anon + authenticated): published + not soft-deleted
create policy catalog_read_public on public.categories for select using (deleted_at is null);
create policy catalog_read_public on public.brands for select using (deleted_at is null);
create policy products_read_public on public.products for select
  using (status = 'published' and deleted_at is null);
create policy products_read_public on public.product_variants for select
  using (is_active and deleted_at is null
         and exists (select 1 from public.products p
                      where p.id = product_variants.product_id
                        and p.status = 'published' and p.deleted_at is null));
create policy product_images_read_public on public.product_images for select
  using (deleted_at is null
         and exists (select 1 from public.products p
                      where p.id = product_images.product_id
                        and p.status = 'published' and p.deleted_at is null));
create policy spec_read_public on public.spec_templates for select using (true);
create policy spec_read_public on public.spec_values for select using (true);
create policy reviews_read_public on public.reviews for select
  using (status = 'published');
create policy synonyms_read_public on public.search_synonyms for select using (true);
create policy price_history_read_public on public.price_history for select using (true);
create policy homepage_sections_read_public on public.homepage_sections for select
  using (active = true);
create policy homepage_items_read_public on public.homepage_section_items for select using (true);

-- buyers may create alerts on themselves (or guest phone)
create policy alerts_owner on public.product_alerts for all
  using (user_id = auth.uid() and active)
  with check (user_id = auth.uid() or anonymous_phone is not null);

commit;