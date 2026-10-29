# Project Overview

อัปเดต 28 ตุลาคม 2026 | Source of truth: app router, components, schemas, README, feature checklist

## เป้าหมาย

ช่วยผู้ใช้รถยนต์ไฟฟ้าวางแผนขับรถท่องเที่ยวในไทย โดยคำนวณเส้นทางจริง ค้นหาสถานีชาร์จ/จุดแวะ และประเมินแบตเตอรี่ตามโปรไฟล์รถ

## ผู้ใช้และสิทธิ์

| ผู้ใช้ | สิ่งที่ทำได้ | หลักฐาน |
|---|---|---|
| ผู้ใช้ทั่วไป | วางแผน ค้นหา และคำนวณเส้นทาง/แบตเตอรี่โดยไม่ล็อกอิน | `TutorialGuide.tsx`, `TripPlanner.tsx` |
| ผู้ใช้ที่ล็อกอิน | ตั้งชื่อ บันทึก เปิด ลบ นำเข้า/ส่งออก route และเลือก Cloud Sync | Auth0 session, `/api/cloud-routes`, planner actions |
| ผู้ดูแล Ads | เข้าหน้า `/cms` ด้วยรหัสผ่านแยก ตั้งค่า script และเปิด/ปิดโฆษณา | `admin-auth.ts`, `AdsAdmin.tsx`, `/api/admin/ads` |

## ฟีเจอร์หลัก

- Trip settings: origin/destination, waypoints, departure, trip type, trip days, route modifiers.
- Vehicle profile: start battery, reserve, capacity, efficiency, range, connector, min kW.
- Map search: autocomplete/text/details, map selection, route summary and route markers.
- Charger search: Google Places EV charging type along a route, polyline segmentation, filters and optional EV Station PluZ query.
- Nearby places: tourism, nature, viewpoint, worship, museum, cafe, restaurant, hotel, gas station, rest stop, shopping; query limit/radius applies.
- User routes: local browser storage; opt-in Cloud Sync stored per Auth0 subject in Redis; import/export JSON after sign-in.
- CMS: responsive ad scripts and enabled flag; hidden public ad area when config disabled.
- Tutorial: first-use/on-demand guide with 27 steps per current component.

## Exclusions / limitations

- `days` is a trip attribute; no separate day-by-day itinerary is implemented (daily-plan feature removed).
- Range/battery is an estimate, not a guarantee; it depends on user inputs and real-world conditions.
- Google Places coverage, charger attributes and brand app links are incomplete/provider-dependent; never infer unknown operator metadata.
- Ads monetization is intentionally last in the current roadmap; do not enable scripts before policy, consent, and provider verification.
