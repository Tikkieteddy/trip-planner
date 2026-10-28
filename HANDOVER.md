# Handover: Tikkie Trip – EV Planner

อัปเดต 28 ตุลาคม 2026 | Version 1.2.2 | Git branch `main`

## Executive Summary

เว็บแอป Next.js สำหรับวางแผนการเดินทางด้วยรถ EV: เลือกต้นทาง/ปลายทาง/จุดแวะ, คำนวณเส้นทาง, ค้นหาสถานีชาร์จและสถานที่แวะ, ประเมินแบตเตอรี่ และจัดเก็บ route แบบ local หรือ Cloud Sync ตามบัญชี Auth0

| หัวข้อ | สถานะที่ยืนยันได้จาก repo |
|---|---|
| Frontend / framework | Next.js App Router, React 19, TypeScript, Tailwind CSS 4 |
| Hosting / source | Vercel project `trip-planner`; GitHub `Tikkieteddy/trip-planner` |
| Maps / routing | Google Maps JavaScript API, Places API (New), Routes API |
| Authentication | Auth0 Next.js SDK; cloud route endpoints อ่าน `session.user.sub` |
| Persistent storage | Upstash Redis REST; ไม่พบ relational database หรือ migration |
| Ads | CMS `/cms`, admin password session และ Redis config; script ถูกส่งไปแสดงใน client เมื่อเปิด |
| Build | `1.2.2`, build id `20261028.2` (Production still serves `1.2.1+20261006.3`) |

## สถานะโดยย่อ

- **Implemented (source verified):** planner, route calculation, EV charger search along route, EV Station PluZ provider query, charging filters/sort, battery estimate, nearby categories, user route library/Cloud Sync, tutorial, CMS ads toggle/config, ttdLab footer.
- **Partial / requires service verification:** Auth0 login and production callbacks; Google billing/quota and actual route/charger results; Redis connectivity and cross-device sync; CMS credentials/config; ad vendor policy and script behavior.
- **NOT VERIFIED:** current Vercel production deployment and env values, external-service credentials/quotas, real-account data migration from legacy Clerk, exact feature behavior on physical phones, every station brand/coverage.
- **NOT FOUND:** SQL/ORM schema, migrations, automated unit/e2e test suite, CI workflow files, repository issue tracker state. Absence is based on current repo search, not proof that no external setup exists.

## Repository State

Repository: `Tikkieteddy/trip-planner`; branch `main`. This handover task does not deploy, change production data, commit, or push. Verify `git status` before starting because a developer workspace may differ.

## Takeover Order

1. Read [CLAUDE.md](CLAUDE.md), [DOCUMENT_INDEX.md](DOCUMENT_INDEX.md), [NEXT_STEPS.md](docs/handover/NEXT_STEPS.md).
2. Validate `.env.local` locally without printing it; configure services only through approved dashboards.
3. Run lint/build; test Auth0 and Redis under a test account before claiming cloud sync works.
4. Test Google Places/Routes flows with explicit awareness of billable quota.
5. Address mobile and end-to-end verification before returning to the deferred Ads monetization work.

## Risks

- Google Places/Routes requests can incur billing and results depend on provider coverage, fields and quotas.
- `GOOGLE_MAPS_SERVER_KEY` must remain server-only; browser key should use HTTP referrer restrictions.
- Cloud routes are keyed by Auth0 subject. Redis absence returns service errors; legacy Clerk migration code requires a verified email and Clerk secret.
- Ads HTML/JS is privileged executable third-party content. Only trusted admin may configure it; validate provider policy, CSP, consent and supply-chain before enabling.
- Battery values are estimates and not a guarantee of reachable range or charger availability.
- `npm test` currently aliases `npm run build`; it is not a unit test suite.

## Detailed Materials

See [DOCUMENT_INDEX.md](DOCUMENT_INDEX.md), [dashboard](docs/handover/HANDOVER_DASHBOARD.html), and [validation record](docs/handover/HANDOVER_VALIDATION.md).
