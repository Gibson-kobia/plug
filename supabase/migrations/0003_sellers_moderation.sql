-- ============================================================================
-- TASK-005 · Migration 0003 · sellers_moderation
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- Scope (DATABASE_SCHEMA 0003 + TASK-005 + Tech-Arch §4.4):
--   seller_profiles (1:1 with profiles)
--   seller_verification_documents (Huduma # pgp_sym_encrypt; KYC gate)
--   listing_drafts (JSONB autosave, 2s debounce target)
--   used_listings (condition enum, moderation status FSM)
--   used_listing_photos, moderation_queue_events, listing_reports,
--   listing_enquiries
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- seller_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.seller_profiles (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles (id) on delete restrict,
  display_name   text not null,
  whatsapp_number text not null check (whatsapp_number ~ '^(\+254|0)?(1[01]\d{7}|[7]\d{8})$'),
  bio            text,
  location       text,
  county         text,
  verified       boolean not null default false,
  kyc_status     text not null default 'pending'
                 check (kyc_status in ('pending','rejected','approved')),
  rating_avg     numeric(2,1) not null default 0 check (rating_avg between 0 and 5),
  listings_count int not null default 0,
  total_reviews  int not null default 0,
  response_time_minutes int,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create unique index if not exists seller_profiles_profile_uq on public.seller_profiles (profile_id);

create trigger seller_profiles_touch_updated_at
  before update on public.seller_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- seller_verification_documents  (KYC; sensitive data encrypted in-db)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.verification_doc_type_enum as enum ('national_id','passport','huduma_card');
  create type public.verification_status_enum as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.seller_verification_documents (
  id                   uuid primary key default gen_random_uuid(),
  seller_profile_id    uuid not null references public.seller_profiles (id) on delete restrict,
  document_type        public.verification_doc_type_enum not null,
  -- Huduma / National ID number — encrypted at rest via pgp_sym_encrypt
  document_number_enc  bytea,
  front_image_url      text not null,
  back_image_url       text,
  selfie_with_id_url   text not null,
  liveness_score       numeric(3,2),
  status               public.verification_status_enum not null default 'pending',
  reviewed_by_id       uuid references auth.users (id) on delete set null,
  reviewed_at          timestamptz,
  rejection_reason     text,
  submitted_at         timestamptz not null default now()
);

create index if not exists verification_docs_seller_idx
  on public.seller_verification_documents (seller_profile_id, status);

-- helper: encrypt/decrypt wrappers (KYC_ENCRYPTION_KEY_PASSPHRASE via env)
create or replace function public.encrypt_kyc_document(plain text)
returns bytea language sql security definer as $$
  select pgp_sym_encrypt(plain, current_setting('app.kyc_key', true));
$$;

create or replace function public.decrypt_kyc_document(enc bytea)
returns text language sql security definer as $$
  select pgp_sym_decrypt(enc, current_setting('app.kyc_key', true));
$$;

-- ---------------------------------------------------------------------------
-- used_listing status FSM (CATALOGUE §11)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.used_listing_status_enum as enum (
    'draft_seller','pending_review','rejected_with_reason','approved_awaiting_images',
    'published','sold_by_seller','expired_90_days','suspended_moderation','deleted_soft'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.used_listings (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references auth.users (id) on delete restrict,
  category_id    uuid not null references public.categories (id) on delete restrict,
  brand_id       uuid references public.brands (id) on delete restrict,
  title          text not null,
  description    text,
  price_kes      numeric(12,2) not null check (price_kes >= 0),
  negotiable     boolean not null default false,
  condition      text not null default 'new'
                 check (condition in ('new','like_new','good','fair','refurbished','open_box','display')),
  location       text,
  county         text default 'Nairobi',
  status         public.used_listing_status_enum not null default 'draft_seller',
  verified_listing boolean not null default false,
  sold_at        timestamptz,
  expires_at     timestamptz not null default (now() + interval '90 days'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists used_listings_status_idx on public.used_listings (status, deleted_at);
create index if not exists used_listings_seller_idx on public.used_listings (seller_id);
create index if not exists used_listings_category_idx on public.used_listings (category_id);

create trigger used_listings_touch_updated_at
  before update on public.used_listings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- listing_drafts  (JSONB autosave, 2s debounce by client; one row per draft;
--                  FK to used_listings created above → declared here)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_drafts (
  id         uuid primary key default gen_random_uuid(),
  seller_id  uuid not null references auth.users (id) on delete cascade,
  listing_id uuid references public.used_listings (id) on delete cascade,
  step       int not null default 1 check (step >= 1),
  content    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_drafts_seller_idx on public.listing_drafts (seller_id, updated_at desc);

create trigger listing_drafts_touch_updated_at
  before update on public.listing_drafts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- used_listing_photos (max 8 per CATALOGUE §08; moderation state)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.photo_status_enum as enum ('pending_review','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.used_listing_photos (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.used_listings (id) on delete cascade,
  url        text not null,
  sort_order int not null default 0,
  status     public.photo_status_enum not null default 'pending_review',
  created_at timestamptz not null default now()
);

create index if not exists used_photos_listing_idx on public.used_listing_photos (listing_id, sort_order);

-- ---------------------------------------------------------------------------
-- moderation_queue_events  (1 listing → N events; append-only)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.moderation_action_enum as enum ('submitted','approved','rejected','suspended','resubmitted');
exception when duplicate_object then null; end $$;

create table if not exists public.moderation_queue_events (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.used_listings (id) on delete cascade,
  moderator_id uuid references auth.users (id) on delete set null,
  action      public.moderation_action_enum not null,
  reason_template text,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists moderation_queue_listing_idx
  on public.moderation_queue_events (listing_id, created_at desc);

-- ---------------------------------------------------------------------------
-- listing_reports
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.report_reason_enum as enum
    ('counterfeit','prohibited','misleading_price','wrong_category','stolen',
     'scam','inappropriate_images','other');
  create type public.report_status_enum as enum ('open','investigating','action_taken','dismissed');
exception when duplicate_object then null; end $$;

create table if not exists public.listing_reports (
  id                     uuid primary key default gen_random_uuid(),
  reporter_id            uuid references auth.users (id) on delete set null,
  reporter_contact_phone text,
  listing_id             uuid not null references public.used_listings (id) on delete cascade,
  reason                 public.report_reason_enum not null,
  description            text,
  image_urls             text[],
  status                 public.report_status_enum not null default 'open',
  assigned_to_id         uuid references auth.users (id) on delete set null,
  resolution             text,
  created_at             timestamptz not null default now(),
  resolved_at            timestamptz
);

create index if not exists listing_reports_status_idx on public.listing_reports (status);

-- ---------------------------------------------------------------------------
-- listing_enquiries  (contact-seller-without-reserve)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_enquiries (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.used_listings (id) on delete cascade,
  buyer_id      uuid references auth.users (id) on delete set null,
  buyer_phone   text,
  message       text,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists listing_enquiries_seller_idx on public.listing_enquiries (listing_id, read_at);

-- ---------------------------------------------------------------------------
-- RLS (final pass in 0006)
-- ---------------------------------------------------------------------------
alter table public.seller_profiles enable row level security;
alter table public.seller_verification_documents enable row level security;
alter table public.listing_drafts enable row level security;
alter table public.used_listings enable row level security;
alter table public.used_listing_photos enable row level security;
alter table public.moderation_queue_events enable row level security;
alter table public.listing_reports enable row level security;
alter table public.listing_enquiries enable row level security;

-- sellers read/own their own profile + docs + drafts; public views verified seller cards
create policy seller_profiles_own on public.seller_profiles for all
  using (profile_id = auth.uid() and deleted_at is null);
create policy seller_profiles_read_public on public.seller_profiles for select
  using (verified = true and deleted_at is null);
create policy kyc_docs_own on public.seller_verification_documents for all
  using (seller_profile_id = (select sp.id from public.seller_profiles sp where sp.profile_id = auth.uid()));
create policy drafts_own on public.listing_drafts for all
  using (seller_id = auth.uid());

-- used_listings: public may read published; sellers own their draft/pending; moderators read all
create policy used_listings_read_public on public.used_listings for select
  using ((status = 'published' or status = 'sold_by_seller') and deleted_at is null);
create policy used_listings_seller_manage on public.used_listings for insert
  with check (seller_id = auth.uid());
create policy used_listings_seller_update on public.used_listings for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());
create policy used_photos_read_public on public.used_listing_photos for select
  using (status = 'approved');
create policy listing_reports_public on public.listing_reports for insert
  with check (reporter_id = auth.uid() or reporter_contact_phone is not null);

commit;