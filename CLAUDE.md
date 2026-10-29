@AGENTS.md

# Tikkie Trip – EV Planner

Primary entry point for Claude Code and other AI coding agents. Reply to the project owner in Thai.

## Project Overview

Next.js web app for planning EV road trips in Thailand: origin/destination/waypoints, Google route calculation, EV chargers along the route (incl. EV Station PluZ query), nearby stops, per-leg battery estimate, and route library (browser storage or Auth0-gated Cloud Sync in Redis). CMS at `/cms` toggles ads.

- Production: https://trip-ev-plan.vercel.app (Vercel project `trip-planner`)
- Repository: `Tikkieteddy/trip-planner`, default branch `main`
- Version source of truth: `package.json` `version` + `build` (see AGENTS.md rules)

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (Turbopack), React 19, TypeScript 6 |
| Styling | Tailwind CSS 4, `lucide-react` icons |
| Validation | `zod` 4 (`src/lib/schemas.ts`) |
| Maps / data | Google Maps JavaScript API (browser), Places API (New) + Routes API (server) |
| Auth | `@auth0/nextjs-auth0` v4 via `src/proxy.ts` (Next 16 replacement for middleware) |
| Storage | Upstash Redis REST (`@upstash/redis`); no SQL database |
| Hosting | Vercel |

## Repository Structure

```
src/app/            pages (/ planner, /cms, /admin/ads -> redirect) and API route handlers
src/app/api/        routes, places, place-details, cloud-routes, ads, admin/{login,logout,ads}
src/components/     TripPlanner (main UI, ~2.4k lines), GoogleMapPanel, PlaceSearchInput,
                    TutorialGuide, AdSlot, AdsAdmin, CreditFooter
src/lib/            google.ts, google-place.ts, polyline.ts, battery.ts, schemas.ts,
                    cloud-routes.ts, ads.ts, admin-auth.ts, auth0.ts, format.ts, maps.ts
src/data/           place-types.ts (charger brands, nearby categories)
src/types/          trip.ts, google-map.d.ts
src/proxy.ts        Auth0 middleware (matcher covers pages + /api)
docs/handover/      architecture, features, API, Redis model, roadmap, dashboard, PDF
```

## Development Commands

```bash
npm ci
npm run dev      # http://127.0.0.1:3000
npm run lint     # ESLint (JS/MJS only - see Known Limitations)
npm run build    # includes TypeScript type check
npm test         # currently runs build only; no unit tests yet
node docs/handover/validate_dashboard.mjs
```

Env var names are in `.env.example`. Local `.env.local` is gitignored; never print or commit it.

## Architecture Reference

- Overview and diagrams: [docs/handover/SYSTEM_ARCHITECTURE.md](docs/handover/SYSTEM_ARCHITECTURE.md), `docs/handover/diagrams/*.mmd`
- API: [docs/handover/API_DOCUMENTATION.md](docs/handover/API_DOCUMENTATION.md)
- Storage: [docs/handover/DATABASE_DOCUMENTATION.md](docs/handover/DATABASE_DOCUMENTATION.md)
- Features: [docs/handover/FEATURE_INVENTORY.md](docs/handover/FEATURE_INVENTORY.md)
- Wireframes: [docs/handover/wireframes/README.md](docs/handover/wireframes/README.md)
- Full index: [DOCUMENT_INDEX.md](DOCUMENT_INDEX.md); handover summary: [HANDOVER.md](HANDOVER.md)

Request flow: browser -> `/api/*` route handler -> zod validation -> Google (server key) or Redis -> JSON response. Google server key never reaches the client.

## Coding Conventions

- Read `node_modules/next/dist/docs/` before using Next.js APIs (AGENTS.md); Next 16 differs from older versions.
- Keep existing architecture; no rewrites or broad refactors without owner approval. Extract from `TripPlanner.tsx` only around code you are changing, with tests.
- Validate all API input with schemas in `src/lib/schemas.ts`.
- UI copy is Thai. Use the `@/` path alias.
- Follow AGENTS.md versioning on every change (PATCH/MINOR/MAJOR + Bangkok-date build id).

## Security Rules

- Never print, copy, or commit `.env.local`, tokens, or keys; document variable names only.
- `GOOGLE_MAPS_SERVER_KEY` is server-only; only `NEXT_PUBLIC_*` may reach the browser.
- Cloud routes are keyed by Auth0 `session.user.sub`; never trust a client-supplied user id.
- Ads HTML/JS is privileged third-party script; only the trusted admin configures it.
- Do not delete Redis data or user data. Do not change production config without approval.

## Testing Requirements

- Before any commit: `npm run lint` and `npm run build` must pass.
- Add tests for changed logic once a test runner exists (planned: Vitest for schemas, polyline, battery, API handlers with mocked services).
- Do not call billable Google APIs in automated tests.
- Record results in `docs/handover/HANDOVER_VALIDATION.md`.

## Deployment Rules

- Work on feature branches; never commit directly to `main`.
- Never deploy to Production, push, force-push, rewrite history, or change the Git remote without explicit owner approval.
- Merging into `main` may auto-deploy on Vercel - treat a merge as a Production deploy.
- Use Vercel Preview for verification. Do not claim a deploy succeeded without evidence (live footer tooltip version or Vercel dashboard).

## Documentation Update Rules

- After a significant change, update the affected docs in `docs/handover/` plus `CHANGELOG.md` and `HANDOVER_VALIDATION.md`.
- Regenerate dashboard/PDF with `docs/handover/generate_report.py` when their content changes; run `validate_dashboard.mjs`.
- Status labels must be evidence-based (Verified / Needs Verification / Missing-Broken). Code existing is not proof a feature works.

## Known Limitations

- Battery figures are estimates from distance and user-entered km/kWh, not vehicle telemetry or a guaranteed range.
- Charger data comes from Google Places; no real-time connector availability.
- No automated test suite and no CI workflow in the repo.
- ESLint ignores `src/**/*.ts(x)`; TypeScript errors are caught only by `npm run build`.
- Auth0, Redis, Google quotas and Vercel env values are not verified end-to-end.
- Legacy Clerk migration path in `cloud-routes.ts` is unverified with real accounts.
