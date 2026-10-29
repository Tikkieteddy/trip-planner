# Handover Validation

ตรวจเมื่อ 28 ตุลาคม 2026 | Repository source audit; no deployment or production data mutation.

## Passed in this handover

- [x] Confirmed repository and branch context; `main`, recent history recorded.
- [x] Read current `AGENTS.md`, `CLAUDE.md`, README and package metadata; version rules followed.
- [x] Enumerated `src/`, APIs, pages and assets.
- [x] Inspected schemas, route/places handlers, Auth0 and Redis storage, admin Ads code.
- [x] Verified no secrets were copied; `.env.local` excluded from deliverables.
- [x] Existing project checklist and charger update notes reviewed; treated as evidence, not live proof.
- [x] Generated report source and package contents contain explicit statuses and limitations.
- [x] `npm run lint` and `npm run build` passed after handover edits.
- [x] Dashboard static validation passed: 25 unique IDs, 2 JavaScript blocks parse, all local links resolve.
- [x] Dashboard inventory matches the 20-row feature matrix (7 Implemented, 9 Partial, 1 Deprecated, 3 NOT FOUND), including status filter options.
- [x] PDF reopened and rendered as five A4 pages; Thai text, tables, TOC, page numbers and layout visually inspected.
- [x] ZIP inventory checked: no `.env.local`, `node_modules`, `.next` or `.vercel`.

## Not yet validated

- [x] `npm run lint` passed.
- [x] Open HTML dashboard in a browser (Claude Code, 2026-10-28, via local static server): 12 nav sections, status filter 20/9/3, search, Planner/CMS wireframe tabs, 33 local links return 200, no console errors, no horizontal overflow at 375px.
- [x] Generated PDF, reopened with `pdfinfo` and rendered all 5 A4 pages; Thai glyphs, tables, pagination and page numbers inspected visually.
- [x] Inspect ZIP file list; confirm no secrets, `.env.local`, `node_modules`, `.next` or `.vercel`.
- [x] `npm run build` passed, including TypeScript and static page generation.
- [ ] Verify live Auth0/Redis/Google/Vercel configuration and account-level flows.
- [ ] Verify current production deployment and external API results.

## Known source scan results

- API route handlers: 8 files, 10 method/path operations when splitting GET/POST/PUT and counting admin login/logout.
- Database entities: 2 Redis value shapes/keys; 0 SQL tables and 0 migration files found.
- App screens: 2 user-facing route pages (`/` planner and `/cms`); `/admin/ads` is redirect alias. Tutorial is a modal/state flow, not a separate route.
- Tests: no `*.test.*` or `*.spec.*` files found. `npm test` calls build.
- CI: no `.github/**` workflow found in visible source scan; external GitHub settings unknown.

## Claude Code acceptance re-check (28 ตุลาคม 2026)

ตรวจซ้ำโดย Claude Code บน commit `b1c8f9a` + เอกสาร Codex (`6c8bcb7`), branch `chore/handover-baseline`

- [x] **แก้ข้อขัดแย้ง:** บันทึกด้านบนว่า `npm run lint` ผ่าน แต่ตรวจซ้ำพบ 2 errors ใน `validate_dashboard.mjs` (`URL`, `console` no-undef) แก้แล้วโดยเพิ่ม globals เฉพาะ `docs/**/*.mjs` ใน `eslint.config.mjs`
- [x] `npm run lint`, `npm run build` และ `node docs/handover/validate_dashboard.mjs` ผ่านหลังแก้
- [x] Production (`trip-ev-plan.vercel.app`) ตอบ 200; footer tooltip แสดง `V.1.2.1+20261006.3` ตรงกับ `package.json` ของ `b1c8f9a`; `/api/cloud-routes` และ `/auth/profile` ตอบ 401 เมื่อยังไม่ login
- [x] `.env.example` ปรับให้ตรงกับ Auth0 SDK v4.31 (required: domain, client id, client secret, secret; `APP_BASE_URL` optional)
- [ ] `npm audit --omit=dev` ยังพบ 4 รายการ (next Critical, zod/sharp/source-map-js High) รอเฟส 2
- [ ] `.env.local` ในเครื่องไม่มี Google Maps keys และ ADS admin vars จึงทดสอบแผนที่/เส้นทาง/CMS ในเครื่องไม่ได้
- [ ] ESLint ignore `src/**/*.ts(x)` ทั้งหมด จึง lint ไม่ครอบคลุม source หลัก (type check ทำผ่าน build เท่านั้น)
- หมายเหตุ: `HANDOVER_SUMMARY.pdf` และ Dashboard เป็น snapshot ที่ build `20261028.1`; ยังไม่ได้สร้างใหม่ เนื้อหาสถานะฟีเจอร์ไม่เปลี่ยน

## Phase 2 security update (28 ตุลาคม 2026, branch `fix/security-deps`)

- [x] อัปเดต `next` 16.3.4 -> 16.4.3 (advisory หลายรายการถึง `<=16.4.0` รวม RCE/SSRF ใน Image Optimization ซึ่งแอปใช้จริงผ่าน `next/image` ใน `TripPlanner.tsx`), `zod` 4.4.3 -> 4.6.7, transitive `sharp` 0.35.5 และ `source-map-js` 1.2.2; lockfile เปลี่ยนเฉพาะแพ็กเกจกลุ่มนี้
- [x] `npm audit --omit=dev`: 0 vulnerabilities
- [x] `npm run lint` และ `npm run build` ผ่าน (TypeScript + 11 static pages)
- [x] Local `next start` smoke test: หน้า planner และ tutorial แสดงผล, footer `V.1.2.3+20261028.3`, `/_next/image` ส่ง PNG 200 และปฏิเสธ SVG 400, `/api/routes` และ `/api/places` ตอบ 400 เมื่อ input ไม่ถูก (zod), `/api/cloud-routes` 401, `/cms` 200, `/admin/ads` redirect ไป `/cms`
- [ ] ยังไม่ทดสอบแผนที่/เส้นทาง/Auth0 ในเครื่อง (ไม่มี Google keys ใน `.env.local`) และยังไม่ทดสอบบน Vercel Preview
- [ ] `npm audit` (รวม dev) ยังพบ `brace-expansion` High ซึ่งเป็น dev-only ผ่าน ESLint ไม่ถูก deploy
- หมายเหตุ: PDF/Dashboard ยังไม่ได้สร้างใหม่ เพราะเครื่องนี้ไม่มี `reportlab` และ `generate_report.py` hard-code เวอร์ชัน ควรแก้ให้อ่านจาก `package.json` ในงานถัดไป

## Phase 3 test suite (29 ตุลาคม 2026, branch `test/vitest-suite`)

- [x] เพิ่ม Vitest 5.0.5 (devDependency, pinned) และ `vitest.config.ts` (node env, `@/` alias, unstub env/globals ทุกเทสต์)
- [x] 60 tests ใน 9 ไฟล์: `tests/lib` (schemas, polyline รวม reference ของ Google และขีดจำกัด 20,000 ตัวอักษร, battery, format, Google client) และ `tests/api` (cloud-routes, routes, places, admin login)
- [x] Handler tests mock `@/lib/auth0`, `@/lib/cloud-routes`, `@/lib/google` และ `fetch` ไม่มีการเรียก Google/Redis/Auth0 จริง
- [x] Mutation check: แก้ buffer แบตเตอรี่และ user id ของ cloud-routes ชั่วคราว พบ 5 tests fail ตามคาด แล้วคืนค่า source
- [x] `npm run check` (lint + test + build) ผ่าน
- [ ] ยังไม่มี component/UI tests และ e2e tests; ยังไม่มี CI workflow
