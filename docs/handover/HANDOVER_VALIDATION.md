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

## Next.js 16.4.6 security patch (20 พฤศจิกายน 2026, branch `fix/next-16.4.6`)

- [x] อัปเดต `next` 16.4.3 -> 16.4.6 ปิด advisory moderate 7 รายการ (ช่วง 16.0.0-16.4.4) รวม SVG rejection bypass ใน image optimization ซึ่งแอปใช้ผ่าน `next/image`; รายการอื่นเกี่ยวกับ `use cache`/`unstable_cache`/Edge runtime ซึ่ง grep ไม่พบใน `src/`
- [x] lockfile เปลี่ยนเฉพาะ `next`/`@next/*` และ metadata ของ optional dependency `@tailwindcss/oxide-wasm32-wasi`
- [x] `npm audit --omit=dev`: 0 vulnerabilities
- หมายเหตุ: working copy ย้ายไป path ที่มี `#` ซึ่งทำให้ Vitest และ Turbopack/Tailwind ใช้ไม่ได้ในเครื่อง; `npm run check` จึงรันใน git worktree ที่ path ไม่มี `#`

## CI workflow (20 พฤศจิกายน 2026, branch `ci/github-actions`)

- [x] เพิ่ม `.github/workflows/ci.yml`: Node 24 (ตรงกับ Vercel), `npm ci` แล้ว `npm run check` ทุก PR และทุก push เข้า `main`; `permissions: contents: read`; ไม่ใช้ secrets
- [x] Production ก่อนงานนี้: footer `V.1.2.5+20261120.1`, Vercel Ready, endpoint หลักตอบตามคาด
- [ ] ยังไม่ได้ตั้ง branch protection ให้ CI เป็น required check (ต้องตั้งใน GitHub settings โดยเจ้าของ)

## Auth0 + Cloud Sync live test (20 พฤศจิกายน 2026, Production `V.1.2.6+20261120.2`)

ทดสอบบน Production ด้วยบัญชีจริงของเจ้าของ (Google login ผ่าน Auth0) ใน browser ที่ยังไม่เคย login; ไม่บันทึกข้อมูลบัญชีหรือเนื้อหา route ในเอกสาร

- [x] ก่อน login: `/auth/profile` 401; `/auth/login?returnTo=%2F` redirect ไปหน้า Universal Login ของ Auth0 tenant `tikkie-trip-auth`
- [x] login (Google) แล้ว redirect กลับ `/`; `/auth/profile` 200, `sub` เป็น `google-oauth2|…`, `email_verified: true`
- [x] `GET /api/cloud-routes` 200 คืน route ที่เคยบันทึกไว้ใน Cloud (Upstash Redis ใช้งานได้บน Production)
- [x] หลัง login แอปรวม route จาก Cloud กับเครื่องอัตโนมัติ (GET + PUT 200) ข้อความ "เปิด Cloud Sync และรวม Route ของคุณแล้ว"
- [x] กด "ซิงก์ตอนนี้": GET + PUT `/api/cloud-routes` 200, ข้อความ "ซิงก์ Route ล่าสุดกับ Cloud แล้ว", จำนวน route คงเดิม (ไม่มีข้อมูลหาย/ซ้ำ)
- [x] `/auth/logout` แล้ว `/auth/profile` และ `/api/cloud-routes` กลับเป็น 401; route ในเครื่อง (localStorage) ยังอยู่ และหน้าเว็บแสดงลิงก์เข้าสู่ระบบ
- [ ] ยังไม่ได้ทดสอบ: บันทึก route ใหม่ (ต้องคำนวณเส้นทางผ่าน Google ซึ่งมีค่าใช้จ่าย), sync ข้ามอุปกรณ์เครื่องที่สอง, การกันข้อมูลข้ามผู้ใช้ด้วยบัญชีที่สอง, legacy Clerk migration
- หมายเหตุ: Claude in Chrome คลิก/รันสคริปต์ไม่ได้เพราะ extension อื่นแทรกหน้าเว็บ จึงทดสอบใน browser ของแอป Claude แทน

## Google Places + Routes live test (20 พฤศจิกายน 2026, Production `V.1.2.6+20261120.2`)

ทดสอบเส้นทางเที่ยวเดียวสั้น ๆ หนึ่งเส้น (ไม่ login) เพื่อจำกัดค่าใช้จ่าย: อนุสาวรีย์ชัยสมรภูมิ -> พระราชวังบางปะอิน, ค่าตั้งต้นของรถและตัวกรอง

- [x] Autocomplete (`/api/places` mode autocomplete) แสดง suggestion ภาษาไทยถูกต้อง; เลือกแล้วโหลดพิกัดด้วย `/api/place-details` 200
- [x] `/api/routes` 200: 57.6 กม. / 51 นาที; แผนที่วาดเส้นทาง; รายการเดินทาง 2 จุดพร้อมระยะ/เวลา
- [x] ประเมินแบตเตอรี่: "ทุกช่วงอยู่ในระดับปลอดภัยโดยประมาณ ใช้พลังงานรวม 7.4 kWh"
- [x] สถานีชาร์จตามเส้นทาง (`route-chargers` provider `all` + `ev-station-pluz`) 200: พบ 10 แห่ง พร้อมระยะจากเส้นทาง หัวชาร์จ kW สถานะ และลิงก์แอปผู้ให้บริการ
- จำนวนการเรียก Google รวม 7 ครั้ง (autocomplete 2, place details 2, routes 1, route-chargers 2)
- [x] **พบปัญหา 1 — kW บนการ์ดไม่ตรงกับเหตุผลแนะนำ:** "กำลังสูงสุด" อ่านเฉพาะ `connectorAggregation[0]` (`PlaceListCard`) แต่ป้ายเหตุผลแนะนำ/การเรียงใช้ค่าสูงสุดของทุกกลุ่มหัวชาร์จ (`maxChargerKw`) เช่น EA Anywhere แสดง "กำลังสูงสุด 75 kW" แต่ป้ายบอก 150 kW
- [x] **พบปัญหา 2 — สถานีชาร์จกระจุกที่ต้นทาง:** ทั้ง 10 แห่งอยู่ในกรุงเทพฯ/นนทบุรี ไม่มีช่วงปทุมธานี-อยุธยาใกล้ปลายทาง เพราะเส้นทางสั้นใช้ polyline ช่วงเดียว (แบ่งช่วงตามความยาวสตริง 18,000 ตัวอักษร) และผล search-along-route จำกัดจำนวน
- [ ] ยังไม่ได้ทดสอบ: ไป-กลับ, จุดแวะ, เส้นทางยาวที่ต้องแบ่งหลายช่วง, ค้นหาสถานที่ใกล้เคียง (ข้อถัดไป)

## Charger fixes + compact hero (20 พฤศจิกายน 2026, branch `docs/google-live-test`, v1.2.7+20261120.3)

- [x] ปัญหา 1: การ์ดสถานีชาร์จแสดงหัวชาร์จ/กำลังสูงสุดจากกลุ่มหัวชาร์จที่เร็วที่สุด ตรงกับป้ายเหตุผลแนะนำและการเรียง
- [x] ปัญหา 2: แบ่งค้นหาสถานีชาร์จตามระยะทางจริงประมาณช่วงละ 40 กม. (สูงสุด 6 ช่วงตามระยะ; เพิ่มได้ถึง 10 ช่วงเฉพาะเมื่อ polyline ยาวเกินขีดจำกัด 18,000 ตัวอักษร) และรวมผลแบบสลับทีละช่วง/ทีละผู้ให้บริการ ก่อนตัดตามจำนวนสูงสุด ทำให้ครอบคลุมทั้งเส้นทาง; ช่วงสุดท้ายถึงปลายทางเสมอ
- ค่าใช้จ่าย: เส้นทาง 57.6 กม. จาก 2 เป็น 4 คำขอ Places (2 ช่วง x 2 ผู้ให้บริการ); เส้นทางยาวสูงสุด 12 คำขอเมื่อแบ่งตามระยะ
- [x] Hero ด้านบน: เอาป้าย/ชื่อ/คำอธิบายออก ปุ่ม "เริ่มวางแผนทริป" อยู่แถวเดียวกับกล่องสรุประยะทาง เวลา แบตเตอรี่ (มือถือ: ปุ่มอยู่บนกล่องสรุป)
- [x] `npm run check`: lint ผ่าน, Vitest 66/66, build ผ่าน; ตรวจ layout ใน dev server ทั้ง desktop และมือถือ
- [x] ทดสอบ charger fix กับ Google จริงบน Production แล้ว (หัวข้อถัดไป)

## Multi-day trips (20 พฤศจิกายน 2026, branch `feature/multi-day`, v1.3.0+20261120.4)

- [x] ปุ่ม "พักค้างคืน" ที่จุดแวะ (และที่ปลายทางของทริปไป-กลับ) แบ่งทริปเป็นวัน วันถัดไปเริ่มจากจุดพัก; จำนวนวันคำนวณให้อัตโนมัติ สูงสุด 14 วัน; วันละไม่เกิน 10 จุดแวะ (ขีดจำกัด Google Routes)
- [x] คำนวณเส้นทางทีละวัน (วันละ 1 คำขอ Routes ตามวันที่ของวันนั้น) และค้นหาสถานีชาร์จแยกตามเส้นทางแต่ละวัน; ยอดรวมทั้งทริป = ผลรวมรายวัน
- [x] แท็บ "ทั้งทริป / วันที่ N" ใต้แถบสรุป: สรุประยะ/เวลา/แบต แผนที่ รายการเดินทาง สถานีชาร์จ และประเมินแบตเปลี่ยนตามวันที่เลือก; แต่ละวันเริ่มด้วยแบตตามที่ตั้งไว้ (ชาร์จที่จุดพัก); เลือกวันแล้วเพิ่มจุดแวะ จุดใหม่จะเข้าไปอยู่ในวันนั้น
- [x] รายการเดินทางแบบทั้งทริปมี "สรุปรายวัน" กดเพื่อไปดู/แก้วันนั้น
- [x] บันทึก/Cloud Sync/นำเข้า-ส่งออกเก็บ `dayPlans`; ข้อความแชร์มีรายการวัน; route เดิมที่ไม่มีวันเปิดได้ตามเดิม
- [x] `npm run check`: lint ผ่าน, Vitest 75/75 (เพิ่ม `tests/lib/trip-days.test.ts`), build ผ่าน
- [x] ตรวจ UI ใน dev server ด้วยทริปตัวอย่าง 3 วัน (กรุงเทพฯ -> เชียงใหม่): แท็บวัน, มุมมองวันที่ 2, สรุปรายวัน, ยกเลิกจุดพักแล้วเหลือ 2 วัน, หน้าจอมือถือไม่ล้นแนวนอน
- [x] ทดสอบกับ Google จริงบน Production หลัง merge (Preview ใช้ไม่ได้: ต้อง login Vercel และ Google key ตั้งไว้เฉพาะ Production) — ดูหัวข้อถัดไป

## Multi-day live test on Production (20 พฤศจิกายน 2026, `V.1.3.0+20261120.4`)

ทริป 2 วัน (ไม่ login): อนุสาวรีย์ชัยสมรภูมิ -> พักค้างคืนพระราชวังบางปะอิน -> อุทยานประวัติศาสตร์พระนครศรีอยุธยา; ใส่ทริปผ่าน localStorage แล้วกดคำนวณในหน้าเว็บ

- [x] Footer `V.1.3.0+20261120.4`, Vercel Ready; hero แถวเดียว
- [x] `/api/routes` 2 ครั้ง (วันละ 1) และ `/api/places` route-chargers 6 ครั้ง ตอบ 200 ทั้งหมด
- [x] แท็บวัน: วันที่ 1 · 21 พ.ย. 58 กม. / 49 นาที; วันที่ 2 · 22 พ.ย. 20.2 กม. / 28 นาที; ทั้งทริป 78.2 กม. / 1 ชม. 17 นาที (= ผลรวม)
- [x] สถานีชาร์จวันที่ 1 (แบ่งค้นหา 2 ช่วง) กระจายกรุงเทพฯ/นนทบุรี/ปทุมธานี/อยุธยา ตามแนวเส้นทาง (ก่อนแก้: กรุงเทพฯ/นนทบุรีทั้งหมด); วันที่ 2 อยู่ในอยุธยา; ทั้งทริปรวม 18 แห่ง
- [x] การ์ดสถานีชาร์จ 18 ใบ: "กำลังสูงสุด" ตรงกับป้าย kW ทุกใบ
- [ ] ยังไม่ได้ทดสอบ: ทริปไป-กลับหลายวัน, จัดลำดับจุดแวะอัตโนมัติต่อวัน, บันทึก/Cloud Sync ทริปหลายวันกับบัญชีจริง, มือถือจริง

## Collapsible side panels (20 พฤศจิกายน 2026, branch `feature/collapsible-panels`, v1.4.0+20261120.5)

- [x] แถบซ้าย (ตั้งค่าทริป) มีปุ่มซ่อนตั้งแต่จอ 1024 px ขึ้นไป; แถบขวา (ผลลัพธ์ทริป) มีปุ่มซ่อนตั้งแต่จอ 1280 px ขึ้นไป (จอเล็กกว่านั้นแถบขวาอยู่ใต้แผนที่อยู่แล้ว)
- [x] เมื่อซ่อน แถบจะยุบเป็นแถบไอคอนแคบ ๆ: ปุ่มแสดงแถบ + ไอคอนเมนู (ทริป/รถ/ตัวกรอง ด้านซ้าย; วางแผน/รายการเดินทาง/จุดชาร์จ/ที่แวะ/รถ ด้านขวา พร้อมตัวเลข) กดไอคอนแล้วเปิดแถบไปที่เมนูนั้นทันที
- [x] แผนที่ขยายเต็มพื้นที่ที่ว่าง: จอ 1600 px ซ่อนทั้งสองข้าง คอลัมน์แผนที่กว้าง 1394 px
- [x] จำสถานะซ่อน/แสดงในเบราว์เซอร์ (`tikkie-trip-panels-v1`) หลังรีโหลด; เริ่มคู่มือแนะนำการใช้งานจะเปิดทั้งสองแถบให้อัตโนมัติ
- [x] มือถือไม่เปลี่ยน: ไม่มีปุ่มซ่อน/แถบไอคอน แม้เคยบันทึกว่าซ่อนไว้; ไม่ล้นแนวนอน
- [x] `npm run check` ผ่าน; ตรวจใน dev server ที่ 1600, 1100 และ 375 px

## Unified header bar (20 พฤศจิกายน 2026, branch `feature/unified-header`, v1.5.0+20261120.6)

- [x] รวมแถบหัว (header) กับแถบสรุปทริปสีเขียวเป็นแถบเดียว (sticky) พื้นหลังภาพถนน + gradient เขียว
- [x] เอาส่วนซ้ำออก: เหลือสรุประยะทาง/เวลา/แบตเตอรี่ชุดเดียว (กดดูคำอธิบายได้เหมือนเดิม, `data-tour="hero-summary"` ย้ายมาที่ชุดนี้)
- [x] เอา "TIKKIE TRAVEL" ออก ชื่อเหลือ "EV Planner"; โลโก้เปลี่ยนเป็นไอคอน ttdLab (`public/ttdlab-logo.png` จาก `ttdLab brand/icon-512.png`)
- [x] ปุ่ม "เริ่มวางแผนทริป" อยู่ในแถบเดียวกัน (มือถือแสดงเป็นไอคอน) และกางแถบตั้งค่าซ้ายถ้าซ่อนอยู่; แท็บรายวันอยู่ใต้แถบ
- [x] จอ 1400 px ขึ้นไปอยู่บรรทัดเดียว (สูง 70 px); จอ ~1000 px แบ่ง 2 บรรทัด (ปุ่ม / สรุป); มือถือ 375 px สูง 113 px ไม่ล้นแนวนอน; กล่องคำอธิบายสรุปทำงาน
- [x] แก้สีลิงก์ในแถบ (เข้าสู่ระบบ) ที่เคยรับสีขาวจาก header
- [x] `npm run check` ผ่าน

## Curated chargers (20 พฤศจิกายน 2026, branch `feature/unified-header`, v1.6.0+20261120.7)

- [x] เพิ่มข้อมูลจุดชาร์จสำรวจเอง 50 แห่ง (`src/data/curated-chargers.ts`): ศาลากลาง/ศาลายา 19, ลพบุรี อ.ท่าหลวง/ชัยบาดาล 7, ลพบุรี อ.เมือง 13, เพชรบูรณ์ อ.เมือง 11 (รวม PEA สำนักงานจังหวัดที่ยังไม่ยืนยัน) พิกัดจากหมุด Google Maps, kW จาก Saifah/PlugShare เมื่อมี
- [x] ค้นหาสถานีชาร์จตามเส้นทางจะรวมจุดสำรวจที่อยู่ห่างเส้นทางไม่เกิน 3 กม. หรือห่างจุดแวะ/ต้นทาง/ปลายทางไม่เกิน 20 กม.; ตัดออกถ้ามีผล Google อยู่ห่างไม่เกิน 150 ม.; ตัวกรองหัวชาร์จ/kW/เปิดอยู่/คะแนน ใช้แบบเข้มงวด (ไม่มีข้อมูล = ไม่แสดง)
- [x] `npm run check` เทียบเท่า (lint, Vitest 83/83 เพิ่ม `tests/lib/curated-chargers.test.ts`, build) ผ่านในสำเนาที่ `npm ci` ใหม่บน Linux (node_modules ในโฟลเดอร์เป็นของ Windows)
- [ ] ยังไม่ได้ตรวจใน UI จริง/Production

## Production check of v1.6.0 + saved-trip charger limit fix (20 พฤศจิกายน 2026, v1.6.1+20261120.8)

- [x] Production `V.1.6.0+20261120.7`: แถบหัวเขียวแถบเดียว โลโก้ ttdLab ชื่อ "EV Planner"
- [x] เส้นทางอนุสาวรีย์ชัยสมรภูมิ -> องค์พระปฐมเจดีย์ (ผ่านศาลายา): 56.2 กม. / 59 นาที; สถานีชาร์จ 27 แห่ง เป็นข้อมูลสำรวจเอง 17 แห่ง มีป้าย "ข้อมูลสำรวจเอง" และข้อความ "ไม่มีสถานะเรียลไทม์"; ไม่พบรายการซ้ำกับผล Google
- [x] พบบั๊ก: ทริปหลายวันที่วันหนึ่งมีสถานีชาร์จเกิน 20 แห่ง (Google 20 + ข้อมูลสำรวจเอง) บันทึก route ไม่ได้ เพราะ `dayPlanSchema` จำกัด chargers ไว้ 20
- [x] แก้: เพดานต่อวัน = 20 + จำนวนจุดสำรวจเอง (70), ทั้งทริป = 14 x 20 + จำนวนจุดสำรวจเอง (330) คำนวณจาก `curatedChargers.length`; เพิ่มเทสต์ใน `tests/lib/schemas.test.ts`
- [x] `npm run check` ผ่าน
