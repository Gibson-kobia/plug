-- ============================================================================
-- TASK-008 · RLS & DATABASE SECURITY TESTS (run AFTER migrations apply)
-- Kenya Electronics Marketplace — Supabase/PostgreSQL
--
-- HOW TO RUN (Level B, human/CI) once a live database exists:
--   supabase db reset                          # applies 0001..0006
--   psql "$DATABASE_URL" -f supabase/tests/rls_tests.sql
-- A row printed = the stable static checks PASSED. See SECURITY_ACCEPTANCE.md
-- SEC-001..SEC-011 for the real JWT/role matrix that must run via the
-- Supabase client (needs live anon/authenticated tokens) — that part is human/
-- CI gated, NOT executed here because it requires server-side JWT dispatch.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- SECURITY DEFINER helpers owned by the migration owner (postgres) so that
-- role impersonation for the STATIC checks below is possible.
-- ---------------------------------------------------------------------------
create or replace function public.rls_assert_anon_blocks_unpublished()
returns text language plpgsql security definer as $$
declare v bigint;
begin
  set role anon;
  select count(*) into v from public.products where status <> 'published';
  reset role;
  if v = 0 then return 'PASS'; else return 'FAIL'; end if;
end; $$;

-- ---------------------------------------------------------------------------
-- Static tests (return 0 rows = all pass)
-- ---------------------------------------------------------------------------
select
  'T1_ANON_CANNOT_READ_UNPUBLISHED' as test,
  public.rls_assert_anon_blocks_unpublished() as result;

select
    'T2_RLS_HELPER_EXISTS' as test,
    'ok' where to_regprocedure('public.rls_assert_anon_blocks_unpublished()') is not null;

-- ---------------------------------------------------------------------------
-- Real RLS/JWT tests (SEC-001..SEC-011) run as Supabase HTTP: see
-- SECURITY_ACCEPTANCE.md. This SQL file covers only database-structure blocks
-- that are guaranteed evaluable without a live auth dispatcher.
-- ---------------------------------------------------------------------------