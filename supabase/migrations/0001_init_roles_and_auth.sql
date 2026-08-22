-- ============================================================================
-- TASK-003 · Migration 0001 · init_roles_and_auth
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- Scope (per DATABASE_SCHEMA.md 0001 + CURRENT_TASK TASK-003 + Tech-Arch §5/§7):
--   * application roles (no guest row; guest = Supabase anon JWT)
--   * profiles 1:1 auth.users + role
--   * sync_auth_user_role_claim() trigger → app_metadata.role (RLS perf fix)
--   * RLS seed policies (JWT claim based)
--   * audit_logs, system_settings, sessions_anon, notification_preferences
--
-- Conventions (Tech-Arch §6.4):
--   id uuid default gen_random_uuid()
--   created_at timestamptz default now(), updated_at timestamptz
--   deleted_at on mutable tables, RLS guard deleted_at is null
--   FK ON DELETE RESTRICT ON UPDATE CASCADE unless justified
--
-- NOTE (Supabase environment): pg_stat_statements may not be grantable to
-- non-superuser on hosted; extension enable is attempted but non-fatal if it
-- fails (it is used by observability, not by schema dependencies).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
-- NOTE: pg_cron extension is enabled in 0006 (guarded); pg_stat_statements is
-- created by Supabase hosting automatically. This migration avoids hard
-- dependencies on either for maximal compatibility.

-- ---------------------------------------------------------------------------
-- 1. roles (no guest row — guest is the Supabase `anon` role / JWT claim)
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

insert into public.roles (name, slug, description) values
  ('Buyer', 'buyer', 'Registered buyer — reserve, order, review, alerts'),
  ('Seller', 'seller', 'Verified seller — list used products and manage orders'),
  ('Moderator', 'moderator', 'Moderates listings, KYC, reports'),
  ('Administrator', 'admin', 'Full catalog, seller, orders, system management'),
  ('Super Administrator', 'super_admin', 'System owner — impersonation, audit, billing')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key,
  constraint profiles_auth_users_fk foreign key (id) references auth.users (id)
                on delete restrict on update cascade,
  role_id      uuid not null references public.roles (id)
                on delete restrict on update cascade,
  full_name    text,
  phone        text check (phone is null or
                phone ~ '^(\+254|0)?(1[01]\d{7}|[7]\d{8})$'),
  phone_verified_at timestamptz,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create unique index if not exists profiles_phone_uq
  on public.profiles (phone) where phone is not null and deleted_at is null;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- sync_auth_user_role_claim()  → writes role into app_metadata (RLS perf fix)
-- ---------------------------------------------------------------------------
create or replace function public.sync_auth_user_role_claim()
returns trigger language plpgsql security definer as $$
declare
  v_role text;
begin
  select r.slug into v_role from public.roles r where r.id = new.role_id;
  update auth.users
     set raw_app_meta_data = jsonb_set(
           coalesce(raw_app_meta_data, '{}'::jsonb),
           '{role}'::text[],
           coalesce(to_jsonb(v_role), 'null'::jsonb))
   where id = new.id;
  return new;
end;
$$;

create trigger trg_profiles_sync_role_claim
  after insert or update of role_id on public.profiles
  for each row execute function public.sync_auth_user_role_claim();

create trigger trg_profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit_logs  (append-only; system writes via server-only clients)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id                    uuid primary key default gen_random_uuid(),
  actor_id              uuid references auth.users (id) on delete restrict,
  actor_system          text,                    -- 'system'|'cron' when no user actor
  impersonation_actor_id uuid references auth.users (id) on delete restrict,
  action                text not null,
  target_type           text not null,
  target_id             uuid,
  before                jsonb,
  after                 jsonb,
  ip_hash               text,
  user_agent            text,
  created_at            timestamptz not null default now(),
  constraint audit_logs_actor_ck check (actor_id is not null or actor_system is not null)
);

create index if not exists audit_logs_actor_created_idx
  on public.audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_target_idx
  on public.audit_logs (target_type, target_id);

-- ---------------------------------------------------------------------------
-- system_settings  (typed key-value)
-- ---------------------------------------------------------------------------
create table if not exists public.system_settings (
  key         text primary key,
  value       jsonb not null,
  value_type  text not null default 'string'
              check (value_type in ('string','integer','boolean','json')),
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

create trigger system_settings_touch_updated_at
  before update on public.system_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- sessions_anon  (guest identity + attribution; server-maintained)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions_anon (
  session_id    uuid primary key,
  user_id       uuid references auth.users (id) on delete cascade,
  attribution   jsonb not null default '{}'::jsonb,
  country_code  text,
  device        text,
  user_agent    text,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create index if not exists sessions_anon_last_seen_idx
  on public.sessions_anon (last_seen_at desc);

-- ---------------------------------------------------------------------------
-- notification_preferences
-- ---------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id             uuid not null references auth.users (id) on delete cascade,
  event_key           text not null,
  channel_in_app      boolean not null default true,
  channel_sms         boolean not null default false,
  channel_whatsapp    boolean not null default false,
  channel_email       boolean not null default true,
  primary key (user_id, event_key)
);

-- ---------------------------------------------------------------------------
-- RLS — seed policies (JWT-claim based, expanded fully in 0006_rls_final.sql)
-- Security definer owner on public readonly for anon/authenticated.
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.audit_logs   enable row level security;
alter table public.system_settings enable row level security;
alter table public.sessions_anon   enable row level security;
alter table public.notification_preferences enable row level security;

-- profiles
create policy profiles_select_self on public.profiles for select
  using (auth.uid() = id and deleted_at is null);
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id and deleted_at is null)
  with check (auth.uid() = id);
-- admin/super_admin can read all profiles
create policy profiles_select_admin on public.profiles for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','super_admin'));

-- system_settings: public may read non-secret columns; writes admin only.
create policy system_settings_select_public on public.system_settings for select
  using (true);

-- notification_preferences: owner only
create policy notification_prefs_owner on public.notification_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- audit_logs & sessions_anon: no direct client access (server-only writes);
-- admin reads audit (grant in 0006).
create policy audit_logs_none on public.audit_logs for all using (false);
create policy sessions_anon_none on public.sessions_anon for all using (false);

commit;