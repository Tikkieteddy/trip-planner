# Development Roadmap

อัปเดต 28 ตุลาคม 2026 | Priorities from existing checklist plus handover audit; not a claim of scheduled work.

## P0 - No high-confidence production proof yet

### Validate Auth0 + cloud route lifecycle
- **Files:** `src/proxy.ts`, `src/lib/auth0.ts`, `src/app/api/cloud-routes/route.ts`, `src/lib/cloud-routes.ts`, planner save flow.
- **Dependencies:** approved Auth0 production config and Upstash env.
- **Acceptance:** sign in, save and read a route; one user cannot read another user's routes; second device sees Cloud route after explicit opt-in; local route remains intact on auth redirect.
- **Verify:** test account and staging or controlled production test route; don't print account or route payload.

## P1 - Real journey workflow

### Verify route calculation and charging recommendations
- **Files:** `/api/routes`, `/api/places`, polyline splitting and charger search in `TripPlanner.tsx`.
- **Dependencies:** Google Routes + Places APIs and billing/quota.
- **Acceptance:** one-way and round-trip route render, long polyline split stays within request schema, deduplication and charger filtering produce sensible results; error states understandable.
- **Verify:** documented test coordinates, no customer data, record API status and UI only.

### Add automated coverage
- **Files:** `package.json`, schemas, battery/polyline libs, endpoint handlers.
- **Dependencies:** test runner decision; currently no test framework found.
- **Acceptance:** tests cover schema bounds, same-point routes, polyline segmentation, battery edge cases, auth-required cloud access and failure states.
- **Verify:** dedicated `npm test` runs tests, not merely `next build`.
- **Status (2026-10-29):** done for libs and API handlers (60 Vitest tests); UI/e2e coverage still open.

### Nearby places quality
- **Files:** `src/data/place-types.ts`, `/api/places`, nearby UI.
- **Acceptance:** fuel/rest-stop categories return recognizable mapped businesses in representative regions; category request handles empty/error responses; do not promise complete operator coverage.
- **Dependencies:** Google Places types/coverage and quota.

## P2 - UX and release confidence

### Phone QA
- **Files:** planner, map, charger cards, tutorial and `CreditFooter`.
- **Acceptance:** sticky controls, single-column station cards, touch tooltip, tutorial spotlight, app link handoff and overflow are usable at phone widths.
- **Verify:** real device or device emulation with screenshots and keyboard/accessibility pass.

### Brand links and provider data maintenance
- **Files:** charger cards/operator mapping.
- **Acceptance:** only verified official provider links; unavailable facts remain unknown rather than guessed.

## P3 - Ads (last, per product instruction)

- Keep ads hidden until account approval, consent/privacy requirements, provider rules, CSP and mobile/desktop sizing are reviewed.
- Test `/cms` login, enabled toggle, Redis persistence, disabled fallback and script containment in a non-production environment first.
- Never insert untrusted user-supplied script, and do not activate monetization before core feature checklist closure.
