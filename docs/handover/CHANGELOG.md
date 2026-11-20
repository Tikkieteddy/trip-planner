# Changelog from Git Evidence

อัปเดตเอกสาร 28 ตุลาคม 2026. Commits listed are the recent visible local history (`git log -10`); this is not a complete release history.

| Date | Commit | Evidence-backed summary |
|---|---|---|
| 2026-11-20 | branch `data/curated-chargers-4-provinces` | Curated chargers: 179 stations (Nakhon Pathom 16, Nonthaburi 3, Lopburi 30, Phetchabun 33, Saraburi 46, Nakhon Sawan 51) collected district by district from Google Maps; data model `zone` -> `province`/`district`, ids from coordinates, `curatedChargerProvinces` counts; version 1.7.1+20261120.12 |
| 2026-11-20 | branch `feature/multi-day-tutorial` | Tutorial: two multi-day steps (overnight button, day tabs), fix outdated day-count text; inline hint in the route panel; version 1.7.0+20261120.11 |
| 2026-11-20 | branch `fix/nearby-categories` | Fix nearby categories: worship used a type Google rejects, viewpoint duplicated tourism, shopping returned unrelated places; nature adds hiking/garden; tests; version 1.6.3+20261120.10 |
| 2026-11-20 | branch `fix/day-charger-limit` (2) | Fix header not staying pinned (overflow-x-hidden -> clip); status messages become a small auto-hiding notice; version 1.6.2+20261120.9 |
| 2026-11-20 | branch `fix/day-charger-limit` | Fix: saving a multi-day trip failed when a day had more than 20 chargers (Google + curated); caps now 20 + curated per day, 14x20 + curated per trip; version 1.6.1+20261120.8 |
| 2026-11-20 | branch `feature/unified-header` | Curated chargers: 50 hand-checked stations (Salaya/Sala Klang, Lopburi Tha Luang + Mueang, Phetchabun Mueang) in `src/data/curated-chargers.ts`, merged into route charger results within 3 km of the route or 20 km of a stop, de-duplicated against Google results, filters respected, badge "ข้อมูลสำรวจเอง"; place source `curated`; version 1.6.0+20261120.7 |
| 2026-11-20 | branch `feature/unified-header` | One green header bar (header + hero merged), single trip summary, title "EV Planner", ttdLab logo; version 1.5.0+20261120.6 |
| 2026-11-20 | branch `feature/collapsible-panels` | Left/right side panels fold into icon rails on desktop so the map fills the space; state remembered per browser; version 1.4.0+20261120.5 |
| 2026-11-20 | branch `docs/multi-day-live-test` | Docs: record Production live test of a 2-day trip (per-day routes, charger spread, kW display); no app code change |
| 2026-11-20 | branch `feature/multi-day` | Multi-day trips: overnight stops split days (max 14), per-day Routes + charger search, day tabs for summary/map/itinerary/chargers/battery, daily summary, saved/shared with day split; version 1.3.0+20261120.4 |
| 2026-11-20 | branch `docs/google-live-test` (fix) | Fix charger card kW to use fastest connector; search chargers in ~40 km route segments with interleaved results; compact one-row hero; version 1.2.7+20261120.3 |
| 2026-11-20 | branch `docs/google-live-test` | Docs: record Production live test of Places autocomplete/details, Routes, battery and route chargers (one short one-way route, 7 Google calls); two charger issues found |
| 2026-11-20 | branch `docs/auth0-cloud-sync-live-test` | Docs: record Production live test of Auth0 login, cloud route read/sync and logout (V.1.2.6+20261120.2); no app code change |
| 2026-11-20 | branch `ci/github-actions` | Add GitHub Actions CI (`.github/workflows/ci.yml`): Node 24, `npm ci` + `npm run check` on PRs and pushes to `main`, read-only token; version 1.2.6+20261120.2 |
| 2026-11-20 | branch `fix/next-16.4.6` | Security: next 16.4.3 -> 16.4.6 (7 moderate advisories up to 16.4.4, incl. SVG rejection bypass in image optimization); `npm audit --omit=dev` 0 vulnerabilities; version 1.2.5+20261120.1 (not deployed) |
| 2026-10-29 | branch `test/vitest-suite` | Add Vitest 5 suite (60 tests: schemas, polyline, battery, format, Google client, cloud-routes/routes/places/admin-login handlers with mocked services); `npm test` runs Vitest, new `npm run check`; version 1.2.4+20261029.1 (not deployed) |
| 2026-10-28 | branch `fix/security-deps` | Security: next 16.3.4 -> 16.4.3, zod 4.4.3 -> 4.6.7, transitive sharp 0.35.5 and source-map-js 1.2.2; `npm audit --omit=dev` 0 vulnerabilities; version 1.2.3+20261028.3 (not deployed) |
| 2026-10-28 | branch `chore/handover-baseline` | Claude Code baseline: fix ESLint globals for `docs/**/*.mjs`, align `.env.example` with Auth0, expand `CLAUDE.md`, ignore `output/`; build 20261028.2 (not deployed) |
| 2026-10-28 | `6c8bcb7` | Add Codex handover documentation package; version 1.2.2+20261028.1 (not deployed) |
| 2026-10-06 | `b1c8f9a` | Add fuel stations to nearby trip stops |
| 2026-10-06 | `20b5d54` | Migrate authentication to Auth0 |
| 2026-10-05 | `097a965` | Stack charging stations in single rows |
| 2026-10-01 | `a8ca002` | Polish Terra Route UI and production workflows |
| 2026-09-30 | `51532b5` | Record production feature verification |
| 2026-09-30 | `a95a1dd` | Hide disabled ads and audit planner features |
| 2026-09-21 | `3647b2e` | Remove daily plans and preserve auth drafts |
| 2026-09-18 | `4ef1dbb` | Show route actions and add sharing |
| 2026-09-18 | `35dfa5d` | Require sign-in before saving routes |
| 2026-09-18 | `0a9c3b0` | Fix saving long routes and expose sign-in |

Descriptions reflect commit subjects only; details should be confirmed with `git show <hash>` before relying on them as behavioral specification.
