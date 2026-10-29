# Database and Storage

อัปเดต 28 ตุลาคม 2026 | NOT a relational database: no SQL/ORM schema or migration files found.

## Upstash Redis REST

Connection variables recognized by source:

- Preferred: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Legacy aliases: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

| Key pattern | Stored value | Scope / use | Source |
|---|---|---|---|
| `trip-planner:cloud-routes:v1:<auth0-sub>` | `{ routes: SavedRoute[], updatedAt: ISO datetime }` | Per Auth0 subject; maximum 25 routes; routes contain trip settings, places, route geometry and charger data. | `src/lib/cloud-routes.ts` |
| `trip-planner:ads:primary` | `{ enabled, mobileScript, desktopScript, updatedAt }` | Single application-wide CMS setting. | `src/lib/ads.ts` |

## Client persistence

Planner state includes local browser persistence and pre-login draft restoration; inspect state keys and migration logic in `TripPlanner.tsx` before changing serialization. Auth0 cloud routes are separate from local data. There is no account-scoped relational entity model in source.

## Data lifecycle and security

- Cloud route data is read/written only after Auth0 session check in `/api/cloud-routes`.
- No expiration/retention policy is specified in source; confirm Upstash/database policy externally (**NOT VERIFIED**).
- Ads scripts are executable markup and must be treated as privileged config.
- Do not include actual user route data, account identifiers, Redis tokens or environment values in handover material.
- `readLegacyClerkRoutes` can locate legacy user by verified email and copy route list into the Auth0 user key; migration behavior and duplicate/empty-account cases require real-account tests.
