import 'server-only';

import { Logtail } from '@logtail/node';

/**
 * Logtail logger (TASK-011).
 *
 * NOTE: architecture referenced `@logtail/next`, but that package requires
 * Next.js >= 15 while this project pins Next 14.2 (see KNOWN_ISSUES OBS-001).
 * We therefore use `@logtail/node` directly and expose a small typed wrapper.
 * When LOGTOKEN is absent the logger no-ops (safe in dev/CI; placeholder must
 * be supplied by the human in .env.local).
 */

let logtailInstance: Logtail | null = null;

export function getLogtail(): Logtail | null {
  if (logtailInstance) return logtailInstance;
  if (!process.env.LOGTOKEN) return null;
  logtailInstance = new Logtail(process.env.LOGTOKEN);
  return logtailInstance;
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  void getLogtail()?.info(message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  void getLogtail()?.warn(message, context);
}

export function logError(message: string, context?: Record<string, unknown>): void {
  void getLogtail()?.error(message, context);
}