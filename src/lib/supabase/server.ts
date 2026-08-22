import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieMethod = Pick<
  ReturnType<typeof cookies>,
  'getAll' | 'set'
>;

/**
 * Supabase SSR client bound to the request cookie jar.
 * Use for server components / route handlers / server actions that need the
 * *request's* identity and RLS semantics (never the service role).
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies() as unknown as CookieMethod;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            cookieStore.set(name, value);
          });
        },
      },
    }
  );
}