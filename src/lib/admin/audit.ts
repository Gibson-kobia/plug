import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export interface LogAuditOptions {
  actorUserId?: string | null;
  actorSystem?: string | null;
  impersonationActorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  ipHash?: string | null;
  userAgent?: string | null;
}

/**
 * Appends an audit event to public.audit_logs.
 * Must only be called server-side.
 */
export async function logAdminAudit(options: LogAuditOptions): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    // Ensure actor is populated
    const actorUserId = options.actorUserId || null;
    const actorSystem = (!actorUserId && !options.actorSystem) ? 'system' : (options.actorSystem || null);

    const { error } = await supabase.from('audit_logs').insert({
      actor_id: actorUserId,
      actor_system: actorSystem,
      impersonation_actor_id: options.impersonationActorId || null,
      action: options.action,
      target_type: options.targetType,
      target_id: options.targetId || null,
      before: options.before ? JSON.parse(JSON.stringify(options.before)) : null,
      after: options.after ? JSON.parse(JSON.stringify(options.after)) : null,
      ip_hash: options.ipHash || null,
      user_agent: options.userAgent || null,
    });

    if (error) {
      console.error('[audit_log] Failed to insert audit event:', error.message, {
        action: options.action,
        targetType: options.targetType,
      });
    }
  } catch (err) {
    console.error('[audit_log] Exception writing audit event:', err);
  }
}
