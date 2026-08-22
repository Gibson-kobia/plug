import 'server-only';

import { createClient } from '@supabase/supabase-js';

/**
 * Service-role admin client. IMPORTANT:
 *  - MUST stay server-only (guarded above).
 *  - NEVER imported from client components or exposed to the browser bundle.
 *  - Bypasses RLS by design; callers are responsible for the stricter
 *    RBAC checks in `src/lib/auth/require.ts`.
 *
 * The `getUser()`-verification server actions flow uses the SSR client
 * (`src/lib/supabase/server.ts`) for JWT re-verification instead; this client
 * is reserved for trusted server-side operations (data repos, cron sweeps).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
  return createClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}