# System Architecture

อัปเดต 28 ตุลาคม 2026 | ภาพแสดง architecture ที่ยืนยันจาก source; env provisioning/production values ไม่ได้ตรวจ

## Components

- Browser: Next.js-rendered React UI, Google Maps JS loader and map, Auth0 React provider.
- Next.js App Router: server page/layout and Route Handlers for Places, Routes, cloud routes and ads.
- Google Maps Platform: Places API (New), Routes API, Maps JavaScript API.
- Auth0: session and authentication via `@auth0/nextjs-auth0`; `src/proxy.ts` runs `auth0.middleware`.
- Upstash Redis REST: per-user route library and ad configuration.
- Vercel: hosting target identified by README and `.vercel` project linkage; current live configuration not independently verified.

## Diagram

See editable [Mermaid source](diagrams/architecture.mmd), [data flow](diagrams/data-flow.mmd) and [sitemap](diagrams/sitemap.mmd). Dashboard contains an offline-rendered schematic version.

## Request flows

1. Browser posts validated JSON to `/api/places` or `/api/place-details`; server calls Google Places with `GOOGLE_MAPS_SERVER_KEY` and a limited field mask.
2. Browser posts route endpoints to `/api/routes`; server invokes Google Routes API with travel mode DRIVE and selected route modifiers.
3. For cloud route GET/PUT, server gets Auth0 session, scopes Redis key by `session.user.sub`, validates saved routes, and returns no-store responses.
4. Public `/api/ads` returns only enabled scripts. Admin GET/PUT requires a signed HttpOnly admin cookie; Redis is preferred, env script fallback is used when storage is absent.

## Security boundaries

- `NEXT_PUBLIC_*` values are browser-visible by design; `GOOGLE_MAPS_SERVER_KEY`, Redis tokens, Auth0 secrets, and admin secrets are server-only.
- Do not copy `.env.local` or credentials into docs, logs, screenshots, or ZIP.
- Auth0 protects user route APIs through session checks in handlers; admin Ads uses a separate 8-hour HMAC-signed cookie.
- Review Ads script execution as trusted code. Do not treat arbitrary script HTML as safe user content.
