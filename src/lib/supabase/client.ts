'use client';

import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton browser client. Used by interactive components and Realtime.
 * NEVER place secrets here — the anon key is publicly safe.
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}