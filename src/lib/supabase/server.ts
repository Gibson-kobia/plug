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
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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