# Architecture Decisions (Evidence-Based)

อัปเดต 28 ตุลาคม 2026. This is an evidence-backed current-state record, not a claim of formal ADR approval.

| Decision/current pattern | Evidence | Trade-off / follow-up |
|---|---|---|
| Next.js App Router is the single web application | `src/app/**`, Next dependency | UI and server APIs share one deployment; protect server-only secrets. |
| Google Places/Routes are proxied through server handlers | `src/app/api/*`, `src/lib/google.ts` | limits key exposure; depends on server key and billable Google APIs. |
| Place/route data uses Zod validation at boundary | `src/lib/schemas.ts` | bounds payload size; keep client and server schema behavior aligned. |
| Cloud route library is JSON in Redis under Auth0 subject key | `cloud-routes.ts` | simple, per-user storage; whole library read/write, no relational queries or source-defined expiry. |
| Local route storage is available separately from opt-in cloud sync | planner UI and cloud API | supports anonymous planning; cross-device requires login + Redis. |
| Auth0 is current identity provider; Clerk code remains for legacy route lookup only | `auth0.ts`, `proxy.ts`, `cloud-routes.ts` | remove legacy path only after migration evidence and product decision. |
| Ads disabled state removes public slot | `AdSlot.tsx`, checklist | protects layout when disabled; active scripts remain a security/privacy concern. |
| Ads configuration is separate from user route accounts | admin auth and Redis keys | single admin passphrase, not a role/identity CMS; rotate/manage externally. |
| Footer version is read from `package.json` | `src/version.ts`, `AGENTS.md` | update package and lockfile with each patch; build date counter follows repo rules. |

No design-record file or explicit ADR numbering was found during source scan (**NOT FOUND**).
