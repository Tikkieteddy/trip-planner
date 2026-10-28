# Setup Guide

อัปเดต 28 ตุลาคม 2026 | Review existing `README.md` first; this document adds auth/storage details found in source.

## Local setup

1. Clone `https://github.com/Tikkieteddy/trip-planner.git` and enter repository root.
2. Install Node/npm compatible with lockfile; run `npm ci`.
3. Copy `.env.example` to `.env.local` and supply values locally. Never print or commit `.env.local`.
4. Configure Google Maps JavaScript API, Places API (New), Routes API. Browser and server keys must be separate and restricted.
5. Configure Auth0 Application for the Next.js SDK. Add local callback/logout/origin URLs to Auth0 settings; exact current dashboard values are **NOT VERIFIED**.
6. For Cloud Sync/Ads persistence, provision Upstash Redis REST and set the preferred `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; legacy KV aliases are recognized.
7. Run `npm run dev`; open `http://127.0.0.1:3000`.

## Environment variable names

| Name | Client/server | Required for |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Public browser | Map JS |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Public browser | Map styling/advanced marker setup |
| `GOOGLE_MAPS_SERVER_KEY` | Server only | Places and Routes requests |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `APP_BASE_URL`, `AUTH0_SECRET` | Server | Auth0 SDK; actual required names depend on installed SDK defaults/configuration (**verify SDK docs**) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Server only | Cloud routes and Ads storage |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Server only, aliases | Legacy storage variables |
| `ADS_ADMIN_PASSWORD`, `ADS_ADMIN_SESSION_SECRET` | Server only | CMS administrator login; password >=10 chars, session secret >=32 chars |
| `AD_SCRIPT_HTML`, `AD_SCRIPT_HTML_MOBILE`, `AD_SCRIPT_HTML_DESKTOP` | Server config, script returned to browser when enabled | Env-backed fallback for ad scripts |
| `CLERK_SECRET_KEY` | Server only, optional legacy | Migration of prior Clerk cloud routes |

The checked-in `.env.example` lists only a subset of these. Confirm the Auth0 SDK's current variable contract from package documentation and installed SDK source; no secret values are part of this handover.

## Validation / deploy

```bash
npm run lint
npm run build
npm test # currently same as build, not unit tests
```

Production hosting target: Vercel project `trip-planner`, domain `https://trip-ev-plan.vercel.app`. Deployment settings, current aliases, env values and latest successful deployment are **NOT VERIFIED** in this handover. No deploy is performed by these instructions.
