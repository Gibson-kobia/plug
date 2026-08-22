/**
 * Public Supabase client barrel.
 *
 * DELIBERATE: `admin.ts` is NOT re-exported here. The service-role client must
 * only ever be imported directly from `src/lib/supabase/admin.ts` (server-only).
 * See Technical-Architecture.md §8.1.
 */
export { createServerSupabaseClient } from './server';
export { getSupabaseBrowserClient } from './client';