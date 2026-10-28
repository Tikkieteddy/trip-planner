# API Documentation

อัปเดต 28 ตุลาคม 2026 | Source: `src/app/api/**/route.ts`, `src/lib/schemas.ts`

All JSON request bodies are validated with Zod unless noted. Public app endpoints are not documented as rate-limited in this source scan. Google server key never belongs in the request.

| Method / path | Auth | Request / response summary | External/storage |
|---|---|---|---|
| `POST /api/places` | public | Discriminated `mode`: `autocomplete`, `text-search`, `route-chargers`, `nearby`. Returns normalized `predictions` or `places`. Bounds include max 20 results; polyline up to 20,000 chars per call; nearby up to 8 included types/radius 1-50 km. | Google Places API (New) |
| `POST /api/place-details` | public | `{ placeId }` -> `{ place }`; 400 on invalid ID; 502 if essential location missing. | Google Places Details |
| `POST /api/routes` | public | `{ origin, destination, waypoints, departureTime?, avoid*, optimizeWaypointOrder? }` -> route distance/duration/polyline/legs/warnings. Rejects same origin/destination when no waypoints. | Google Routes API |
| `GET /api/cloud-routes` | Auth0 session | Returns `{ routes }`; optional migration from legacy Clerk for verified email; 401 without session, 503 storage/format errors. `Cache-Control: no-store`. | Upstash Redis |
| `PUT /api/cloud-routes` | Auth0 session | `{ routes: SavedRoute[] }`; max 25 routes; 401/400/503 on failure. | Upstash Redis |
| `GET /api/ads` | public | `{ enabled, mobileScript, desktopScript }`; scripts blank if disabled/storage read fails. no-store. | Redis or env fallback |
| `POST /api/admin/login` | password exchange | `{ password }`; sets HttpOnly, SameSite=Strict cookie with 8-hour HMAC session; 401 wrong password; 503 incomplete env. | Environment secrets |
| `POST /api/admin/logout` | cookie clearing | Clears admin cookie; returns `{ ok: true }`. | none |
| `GET /api/admin/ads` | admin cookie | Returns config and storage readiness; 401/503 on failure. | Redis/env |
| `PUT /api/admin/ads` | admin cookie | `{ enabled, mobileScript, desktopScript }`; each script max 30,000 chars; enabled requires both non-empty; returns config. | Redis |

## Validation details

- Saved route library: max 25, each name max 120 chars, waypoints max 10, `routeStops` max 12, chargers max 30.
- `savedTripSchema` supports version 1 and 2. Saved route storage includes user name/data; do not log payloads.
- API error messages are localized; Google errors are normalized by `src/lib/google.ts`.
- Auth0 routes exposed by SDK are not explicit handlers under `src/app/api`; auth setup lives in `src/lib/auth0.ts`, `src/proxy.ts`, and SDK conventions. Confirm exact callback URLs in Auth0 dashboard.
