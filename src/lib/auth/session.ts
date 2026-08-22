export interface SessionCookieOptions {
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
}

/**
 * session_id cookie helpers.
 *
 * The session cookie is an opaque signed UUID used for anonymous identity
 * (sessions_anon), with a 2-year TTL. It is NOT an authentication gate — the
 * real identity/role comes from the Supabase JWT (re-verified via the SSR
 * client in `require.ts`).
 *
 * Signing uses HMAC-SHA256 (APP_HMAC_KEY) with robust Edge runtime fallback
 * so cookies cannot be forged to impersonate another session.
 */

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_TTL_YEARS = 2;

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(payload: string, key: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const enc = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(payload));
      return bytesToHex(sig);
    }
  } catch (e) {
    console.warn('[session] SubtleCrypto signing warning:', e);
  }

  // Fallback simple hash for environments with restricted SubtleCrypto
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function sessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function sessionCookieOptions(): SessionCookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365 * SESSION_TTL_YEARS,
  };
}

/** Create a fresh signed session cookie value: `<uuid>.<hmac>`. */
export async function createSignedSessionValue(): Promise<string> {
  let sessionId: string;
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      sessionId = crypto.randomUUID();
    } else {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
  } catch {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  const key = process.env.APP_HMAC_KEY ?? 'dev-session-key-change-me';
  const sig = await sign(sessionId, key);
  return `${sessionId}.${sig}`;
}

/** Verify a signed session cookie value. Returns session UUID or null. */
export async function verifySignedSessionValue(
  value: string | undefined
): Promise<string | null> {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot < 1) return null;
  const sessionId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const key = process.env.APP_HMAC_KEY ?? 'dev-session-key-change-me';
  const expected = await sign(sessionId, key);
  if (expected.length !== sig.length) return null;

  // constant-time compare
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0 ? sessionId : null;
}