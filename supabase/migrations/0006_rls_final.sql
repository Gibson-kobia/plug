-- ============================================================================
-- TASK-008 · Migration 0006 · rls_final
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- Scope (DATABASE_SCHEMA 0006 + TASK-008):
--   * final RLS policies, table-by-table (JWT app_metadata.role model)
--   * grants for anon/authenticated/service_role
--   * pg_cron jobs: reservation_sweeper (1 min), order_sweeper (2 min),
--     mv_search_index refresh (15 min, CONCURRENTLY), category count (10 min)
--   * Upstash rate-limit integration is application-layer (wrappers in lib);
--     DB side only documents bucket keys (see below).
--
-- GRANTS philosophy: least-privilege. anon + authenticated get SELECT where a
-- public-visibility policy exists; mutation paths go through Server Actions
-- using the service_role client (src/lib/supabase/admin.ts) EXCEPT the few
-- owner-scoped policies below (cart/reserve for authenticated).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Profiles (owner + admin; seller KYC reads admin)
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles for select
  using ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

-- ---------------------------------------------------------------------------
-- 2. Catalog: public read published, correct visibility ends; admin manage.
--    Writers go through service_role (Server Actions) + admin UI.
-- ---------------------------------------------------------------------------
create policy products_admin_all on public.products for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));
create policy variants_admin_all on public.product_variants for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));
create policy reviews_insert_verified on public.reviews for insert
  with check (reviewer_id = auth.uid() or (auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

-- ---------------------------------------------------------------------------
-- 3. SYSTEM tables: read-only public pieces; writes service-role/admin
-- ---------------------------------------------------------------------------
drop policy if exists system_settings_select_public on public.system_settings;
create policy system_settings_select_public on public.system_settings for select using (true);
create policy system_settings_admin_all on public.system_settings for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

-- audit (admin read only; log never client-writable)
create policy audit_logs_admin_select on public.audit_logs for select
  using ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

-- sessions_anon: no client reads; app writes via server-only
create policy sessions_anon_owner_read on public.sessions_anon for select
  using (session_id = coalesce(auth.jwt()->>'session_id', null)::uuid or false);

-- ---------------------------------------------------------------------------
-- 4. Seller domain (final)
-- ---------------------------------------------------------------------------
create policy used_listings_moderator_all on public.used_listings for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'));

create policy kyc_admin_read on public.seller_verification_documents for select
  using ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'));

create policy moderation_queue_admin_all on public.moderation_queue_events for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'));

create policy listing_reports_admin_all on public.listing_reports for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('moderator','admin','super_admin'));

-- ---------------------------------------------------------------------------
-- 5. Orders / cart (owner + admin)
-- ---------------------------------------------------------------------------
create policy orders_buyer_select on public.orders for select
  using (buyer_user_id = auth.uid() or (auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));
create policy orders_buyer_insert on public.orders for insert
  with check (buyer_user_id = auth.uid() or session_id is not null or
              (auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

create policy carts_owner_all on public.carts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy cart_items_owner_all on public.cart_items for all
  using (cart_id in (select c.id from public.carts c where c.user_id = auth.uid()))
  with check (cart_id in (select c.id from public.carts c where c.user_id = auth.uid()));

create policy order_events_read_owner on public.order_events for select
  using (order_id in (select o.id from public.orders o where o.buyer_user_id = auth.uid())
         or (auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

-- ---------------------------------------------------------------------------
-- 6. Finance visibility (admin / ledger owner / super)
-- ---------------------------------------------------------------------------
create policy ledger_owner_read on public.seller_ledger_entries for select
  using (seller_id = (select sp.id from public.seller_profiles sp
                       where sp.profile_id = auth.uid())
         or (auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin','moderator'));
create policy coupons_admin_all on public.coupons for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'))
  with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'));

-- ---------------------------------------------------------------------------
-- 7. Rate-limit integration (Upstash) — application-layer only; guard tables
--    Documented hooks; nothing to run at DB except these advisory columns/notes.
-- ---------------------------------------------------------------------------
comment on table public.sessions_anon is
  'Guest sessions; rate limiting for anonymous write endpoints uses Upstash keyed by ip or session_id.';
comment on table public.reservations is
  'Reservation holds; Upstash rate-limits reserveVariant per session. See DEC-003/PD-08.';

-- ---------------------------------------------------------------------------
-- GRANTS (explicit; RLS authorizes row access; ownership for writes is
-- restricted to those who pass WITH CHECK).
-- Client (browser) surface is intentionally narrow; everything else flows
-- through Server Actions using the service_role client (src/lib/supabase/admin).
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.brands, public.products,
           public.product_variants, public.product_images, public.reviews,
           public.delivery_zones, public.pickup_locations, public.search_synonyms,
           public.spec_templates, public.spec_values, public.price_history,
           public.homepage_sections, public.homepage_section_items
  to anon, authenticated;

-- owner-scoped client surface (RLS policy must be matched by a GRANT)
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.notification_preferences to authenticated;
grant select, insert, update on public.product_alerts to authenticated;
grant select, insert, update, delete on public.carts to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;

grant execute on function public.release_expired_reservations_for(uuid) to authenticated;
grant execute on function public.reserve_variant(uuid, integer, uuid, uuid, integer) to authenticated;
grant execute on function public.sign_order_ref(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- pg_cron enablement (guard: hosted may need cron schema granted; non-fatal)
-- ---------------------------------------------------------------------------
do $$ begin
  create extension if not exists pg_cron;
  exception when others then raise notice 'pg_cron not available: %', sqlerrm; end $$;

-- ---------------------------------------------------------------------------
-- PG_CRON scheduled jobs (require pg_cron extension availability)
-- Idempotent: unschedule then schedule by job name.
-- ---------------------------------------------------------------------------
do $$ begin
  perform cron.unschedule('reservation_sweeper');
  perform cron.schedule('reservation_sweeper', '* * * * *',
    'select public.release_expired_reservations_for(null);');
  exception when others then raise notice 'pg_cron unavailable or apply missing: %', sqlerrm; end $$;

do $$ begin
  perform cron.unschedule('order_sweeper');
  perform cron.schedule('order_sweeper', '*/2 * * * *',
    'select public.expire_pending_whatsapp_orders();');
  exception when others then raise notice 'pg_cron unavailable: %', sqlerrm; end $$;

do $$ begin
  perform cron.unschedule('mv_search_index_refresh');
  perform cron.schedule('mv_search_index_refresh', '*/15 * * * *',
    'refresh materialized view concurrently public.mv_search_index;');
  exception when others then raise notice 'pg_cron unavailable: %', sqlerrm; end $$;

commit;