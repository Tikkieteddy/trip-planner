# Feature Inventory

อัปเดต 28 ตุลาคม 2026. Status combines source inspection, existing `SYSTEM-FEATURE-CHECKLIST.md`, and commands run in this handover. It does not imply all live integrations were tested.

สรุปผลตรวจ 20 รายการ: **Implemented 7 · Partial 9 · Deprecated 1 · NOT FOUND 3**. คำว่า Implemented หมายถึงพบโค้ดใน source ไม่ได้ยืนยันว่าบริการภายนอกหรือ workflow จริงผ่านการทดสอบครบแล้ว.

| Feature | Module / source | Status | Dependencies | Known gaps / next check | Priority |
|---|---|---|---|---|---|
| EV trip settings / one-way / round-trip | `TripPlanner.tsx`, schemas | Implemented | Browser | Run real route scenarios | P1 |
| Place autocomplete and details | `PlaceSearchInput.tsx`, `/api/places`, `/api/place-details` | Implemented in source | Google Places | Production quota/auth and ambiguous names | P1 |
| Map selection, markers, route line | `GoogleMapPanel.tsx` | Implemented in source | Maps JS key, map ID | Physical phone and live key restrictions | P1 |
| Google route calculation | `/api/routes`, `lib/google.ts` | Implemented in source | Routes API, server key | Test standard + round-trip on production | P1 |
| EV charger search along route | `/api/places`, `polyline.ts` | Implemented in source | Places API | Verify long route and actual results | P1 |
| Long-polyline segmentation | `polyline.ts`, planner | Implemented in source | Places API | Route coverage/result overlap on very long trips | P2 |
| EV Station PluZ supplemental query | `provider` request mode | Implemented in source | Google Places data | Brand precision/duplicates not externally verified | P2 |
| Charger filters/sort/app links/badges | `TripPlanner.tsx`, `place-types.ts` | Implemented in source | provider metadata | Verify each known brand link and mobile layout | P2 |
| Nearby categories incl. fuel/rest stop | `place-types.ts`, planner, Places nearby | Implemented in source | Google Places | Store/brand coverage varies; verify PTT in chosen area | P1 |
| Battery profile and per-leg estimate | `lib/battery.ts`, planner | Implemented in source | user-provided vehicle inputs | Not vehicle telemetry; test edge cases | P2 |
| Route local save/import/export/share | planner, schemas | Implemented in source | Auth0 gate for actions | Browser persistence and share round-trip | P1 |
| Cloud Sync | `/api/cloud-routes`, `cloud-routes.ts` | Partial / service-dependent | Auth0 + Upstash Redis | Confirm Production env, account isolation, second device | P1 |
| Clerk legacy route migration | `cloud-routes.ts` | Partial / optional legacy path | Clerk secret + verified email + Redis | Migration is not verified with real accounts | P3 |
| First-use tutorial | `TutorialGuide.tsx` | Implemented in source | browser storage | 27-step spotlight QA on physical phone | P2 |
| CMS login and Ads enable/disable | `/cms`, `/api/admin/*`, `admin-auth.ts` | Implemented in source | Admin env + optional Redis | Security review, provider approval, live test | P3, last |
| Responsive ttdLab footer/version tooltip | `CreditFooter.tsx`, `version.ts` | Implemented in source | package metadata | Keyboard/touch QA remains external | P2 |
| Daily itinerary by selected days | removed per checklist/tutorial | Deprecated / not implemented | - | Do not claim number of days creates day plans | - |
| Unit/integration/e2e test suite | `package.json` | NOT FOUND | - | `npm test` only aliases build | P1 |
| CI workflow | repo search | NOT FOUND | GitHub configuration may exist outside repo | Inspect GitHub settings if permitted | P2 |
| SQL/ORM database and migrations | repo search | NOT FOUND | Redis is current persistence | No relational schema in source | - |

## Status definitions

- **Implemented in source:** code path exists; external services or full user flow may remain unverified.
- **Partial / service-dependent:** code exists but requires credentials/provider operation, migration or end-to-end evidence.
- **NOT FOUND:** no matching source/test/config found in this repo scan.
- **Deprecated:** intentionally removed or not part of current behavior.
