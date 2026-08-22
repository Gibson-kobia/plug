import 'server-only';

/**
 * Baselime instrumentation adapter (TASK-011).
 *
 * STATUS: architecture (Technical-Architecture §2) lists `@baselime/nextjs`,
 * but that package is NOT published on npm (404 as of 2026-08-08) — see
 * KNOWN_ISSUES OBS-001. We therefore provide a documented, credential-gated
 * adapter that no-ops until a human chooses a compatible Baselime/OTel SDK
 * (or a later task wires @vercel/otel). No credentials are fabricated.
 */

export interface TraceContext {
  /** e.g. 'reserveVariant', 'createOrder', 'moderateApproval', 'applyCoupon' */
  operation: string;
  properties?: Record<string, unknown>;
}

let baselimeConfigured = false;

export function isBaselimeConfigured(): boolean {
  return baselimeConfigured;
}

export function configureBaselime(_options: { apiKey?: string }): void {
  // No-op adapter. When a supported SDK is selected this becomes the init point.
  // Must be called from instrumentation.ts / server bootstrap, server-only.
  baselimeConfigured = Boolean(_options.apiKey);
}

export function trace(spanName: string, _ctx?: Omit<TraceContext, 'operation'>): void {
  // Placeholder — replaced when Baselime/OTel SDK lands. Kept as a stable API
  // so call sites (TASK-104+) do not need rewiring.
  void spanName;
}

export function recordMetric(
  name: string,
  _value: number,
  _tags?: Record<string, string>
): void {
  void name;
}