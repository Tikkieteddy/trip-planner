# Tikkie Trip – EV Travel Planner

Tikkie Trip เป็นเว็บแอปสำหรับวางแผนเที่ยวด้วยรถ EV ภายใน repository `Tikkieteddy/trip-planner` เป็น Next.js application แยกเดี่ยวสำหรับ deploy บน Vercel project `trip-planner`

## ระบบนี้ทำอะไร

- ค้นหาต้นทาง ปลายทาง และจุดแวะจาก Google Places API (New)
- คำนวณเส้นทางด้วย Google Routes API
- แสดง Google Map, route polyline, marker ต้นทาง ปลายทาง จุดแวะ สถานีชาร์จ และสถานที่ใกล้เคียง
- ค้นหาสถานีชาร์จ `electric_vehicle_charging_station` ตามแนว encoded polyline ของเส้นทาง
- ค้นหาร้านอาหาร คาเฟ่ ห้องน้ำ ห้าง โรงแรม และสถานที่ท่องเที่ยวใกล้จุดชาร์จหรือศูนย์กลางที่เลือก
- ประเมินแบตเตอรี่ในแต่ละ leg จากค่ารถที่ผู้ใช้แก้ไขได้
- บันทึกทริปลง `localStorage` และนำเข้า/ส่งออก JSON โดยไม่บันทึก API key

## วิธีติดตั้ง

```bash
npm ci
```

ถ้าเพิ่งสร้าง lockfile ครั้งแรกในเครื่องพัฒนา ให้ใช้:

```bash
npm install
```

## วิธีสร้าง `.env.local`

สร้างไฟล์ `.env.local` จาก `.env.example`

```env
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
GOOGLE_MAPS_SERVER_KEY=
```

ห้ามใส่ key จริงใน Git และห้ามใช้ server key ใน client

## API ที่ต้องเปิดใน Google Cloud

- Maps JavaScript API
- Places API (New)
- Routes API

## วิธีสร้าง Browser API Key

1. ไปที่ Google Cloud Console
2. เปิดโปรเจกต์ที่ใช้ billing แล้ว
3. ไปที่ APIs & Services > Credentials
4. Create credentials > API key
5. จำกัดสิทธิ์ key ให้ใช้เฉพาะ Maps JavaScript API
6. จำกัด HTTP referrer เช่น `https://trip-planner.vercel.app/*` และ localhost ที่ใช้พัฒนา
7. นำค่าไปใส่ `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`

## วิธีสร้าง Server API Key

1. สร้าง API key แยกอีกตัวสำหรับ server
2. จำกัดสิทธิ์ key ให้ใช้เฉพาะ Places API (New) และ Routes API
3. จำกัด key ด้วย IP หรือข้อจำกัดที่เหมาะกับ Vercel/ระบบ production ของโปรเจกต์
4. นำค่าไปใส่ `GOOGLE_MAPS_SERVER_KEY` ใน Vercel Environment Variables

## แนวทางจำกัดสิทธิ์ API Key

- Browser key ใช้เฉพาะแสดงแผนที่ใน browser
- Server key ใช้เฉพาะ Route Handler ฝั่ง server
- ไม่ใช้ key ตัวเดียวกันทั้ง browser และ server
- ใช้ Field Mask เท่าที่จำเป็น
- จำกัดจำนวนผลลัพธ์และรัศมีค้นหา
- อย่า log key หรือ request ที่มี secret

## วิธีรัน Local

```bash
npm run dev
```

เปิด `http://127.0.0.1:3000`

## วิธี Build

```bash
npm run lint
npm run build
```

## วิธี Deploy บน Vercel

ใช้ Vercel Project ชื่อ `trip-planner` กับ GitHub repository `Tikkieteddy/trip-planner`

## วิธีเชื่อม repo เดียวกับ Vercel Project ใหม่

1. เข้า Vercel Dashboard
2. Add New Project
3. เลือก GitHub repository `Tikkieteddy/trip-planner`
4. ตั้งค่า build เป็น Next.js ปกติ

## วิธีตั้ง Root Directory

ในหน้า Project Settings ของ Vercel ให้ตั้ง:

```text
Root Directory: ./
Framework Preset: Next.js
```

## วิธีตั้งชื่อ Project เป็น `trip-planner`

ในขั้นตอน import หรือ Project Settings ให้ใช้ชื่อ:

```text
trip-planner
```

Production domain ที่ต้องตรวจสอบหลัง deploy:

```text
https://trip-planner.vercel.app
```

## วิธีเพิ่ม Environment Variables

เพิ่มใน Vercel Project `trip-planner`

```env
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=...
GOOGLE_MAPS_SERVER_KEY=...
```

เลือก Environment ให้ครบ Production, Preview และ Development ตาม workflow ที่ใช้

## ข้อจำกัดของข้อมูลสถานีชาร์จ

ข้อมูลหัวชาร์จ กำลังชาร์จ จำนวนหัวชาร์จ สถานะเปิดปิด และ availability ขึ้นกับข้อมูลที่ Google Places API ส่งกลับมา ถ้าไม่มีข้อมูล แอปจะแสดงคำว่า “ไม่มีข้อมูลจากผู้ให้บริการ” และจะไม่เดาค่าเอง

## คำเตือนเรื่องการคำนวณแบตเตอรี่

การประเมินแบตเตอรี่เป็นการประมาณการจากระยะทาง ความจุแบตเตอรี่ และค่า km/kWh ที่ผู้ใช้ตั้งเอง ผลจริงขึ้นกับความเร็ว สภาพอากาศ การจราจร น้ำหนักบรรทุก การเปิดเครื่องปรับอากาศ ความลาดชัน และสภาพแบตเตอรี่
