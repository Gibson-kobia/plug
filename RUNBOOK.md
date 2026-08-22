# RUNBOOK — Kenya Electronics Marketplace (draft, TASK-011)

> Draft operations runbook. All alert thresholds come from Technical-Architecture §8.4.
> Credentials referenced are environment placeholders only — see `KNOWN_ISSUES` OBS-001/002 for SDK gaps.

## 1. Observability stack (as configured)

| Service | Role | Env var | Status |
|---------|------|---------|--------|
| Sentry (client/server/edge) | Error + trace capture | `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Config files present; no-op until DSN supplied |
| Logtail (via `@logtail/node`) | Structured logs | `LOGTOKEN` | No-op until token supplied |
| Baselime (adapter stub) | APM traces | `BASELIME_API_KEY` | Adapter present; SDK unavailable on npm (OBS-001) |
| Slack ops alerts | Alert delivery | `SLACK_OPS_WEBHOOK_URL` | Placeholder only |

## 2. Horn-wide invariants
1. Never log secrets: no API keys, tokens, JWT values, or PII (phone numbers, emails only hashed/redacted where strictly needed).
2. Never sync a phrase like "API key" into logs — filter via sensitive data rules if an SDK integration is added later.
3. All sources must follow provenance rule (AI_START_HERE §4.4): business values derive from authoritative state.

## 3. Alert policies (TAIL §8.4) — configure in Slack/Sentry once webhook present
| # | Policy | When to alarm |
|---|--------|---------------|
| 1 | 5xx rate | > 1% for 2 consecutive minutes |
| 2 | createOrder p95 latency | > 2 s for 5 minutes |
| 3 | Postgres dead tuples | > 20 M (autovacuum backlog) |
| 4 | Reservation anomaly | active_reservations / successful_orders > 0.7 for 10 min |
| 5 | RLS denials | > 5 in any user session |
| 6 | KYC queue | > 30 pending items (SLA 24h) |

## 4. On-call / incident flow (draft)
1. Alert fires → Slack `#ops-alerts`.
2. Triage: check Sentry (errors), Logtail (logs), and DB (dead tuples/queue) concurrently.
3. For stock/reservation anomalies see DB restore + `reserve_variant` verification steps (GO_LIVE_/DATABASE_ACCEPTANCE).
4. Escalate to Supabase support if DB issues (PgBouncer anomalies, PITR concerns).

## 5. PITR / backup (from TA §8.4)
- **PITR**: Supabase 7-day retention; verify daily.
- **Offsite backup**: weekly encrypted export; RTO 1 h / RPO 5 m.
- **Restore procedure**: (stub) — to be completed in TASK-011 once project ops exist.

## 6. Dependency note (OBS-001 / OBS-002)
- `@baselime/nextjs` not published on npm (404) — adapter stub in `src/lib/observability/baselime.ts`.
- `@logtail/next` requires Next ≥15 — project pins 14.2, so `@logtail/node` wrapper used (see `src/lib/observability/logtail.ts`).

## 7. Required human actions
- Provide `SENTRY_*`, `LOGTOKEN`, `BASELIME_API_KEY`, `SLACK_OPS_WEBHOOK_URL` in `.env.local` (never commit).
- Decide Baselime SDK path (OBS-001) or drop the adapter.
- Verify real-alert delivery once Slack webhook present.

**End of RUNBOOK.md (draft). Keep updated (append-only via CM / CONTROL).**