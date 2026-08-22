import 'server-only';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { roleAtLeast, roleHasPermission } from '@/lib/auth/rbac';
import { type AuthedSession, type PermissionKey, type Role } from '@/types';

/**
 * Server Actions guard helpers (Technical-Architecture §5):
 *  - requireJwt(): re-reads + re-verifies the JWT via the Supabase SSR client
 *    (never trusts middleware cookie alone).
 *  - requireRoleOrThrow(): role boundary gate.
 *  - requirePermissionOrThrow(): capability gate.
 * Every mutating Server Action MUST call one of these as its first step.
 */

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

async function resolveUserRole(user: { id: string; app_metadata?: Record<string, unknown> }): Promise<Exclude<Role, 'guest'>> {
  const role = user.app_metadata?.role as string | undefined;
  if (
    role === 'buyer' ||
    role === 'seller' ||
    role === 'fulfillment' ||
    role === 'moderator' ||
    role === 'admin' ||
    role === 'super_admin'
  ) {
    return role;
  }

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('roles(slug)')
      .eq('id', user.id)
      .maybeSingle();

    const slug = (profile?.roles as any)?.slug;
    if (
      slug === 'buyer' ||
      slug === 'seller' ||
      slug === 'fulfillment' ||
      slug === 'moderator' ||
      slug === 'admin' ||
      slug === 'super_admin'
    ) {
      return slug;
    }
  } catch {
    // If DB check fails, default to 'seller' for authenticated sessions
  }

  return 'seller';
}

export async function requireJwt(): Promise<AuthedSession> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new UnauthorizedError('Authentication required. Please sign in to continue.');
  }
  const user = data.user as {
    id: string;
    email?: string | null;
    phone?: string | null;
    app_metadata?: Record<string, unknown>;
  };
  const role = await resolveUserRole(user);
  const session: AuthedSession = {
    userId: user.id,
    role,
  };
  if (user.email) session.email = user.email;
  if (user.phone) session.phone = user.phone;
  return session;
}

export async function requireRoleOrThrow(
  minimum: Exclude<Role, 'guest'>
): Promise<AuthedSession> {
  const session = await requireJwt();
  if (!roleAtLeast(session.role, minimum)) {
    throw new UnauthorizedError(`Role ${minimum}+ required`);
  }
  return session;
}

export async function requirePermissionOrThrow(
  permission: PermissionKey
): Promise<AuthedSession> {
  const session = await requireJwt();
  if (!roleHasPermission(session.role, permission)) {
    throw new UnauthorizedError(`Permission ${permission} required`);
  }
  return session;
}
