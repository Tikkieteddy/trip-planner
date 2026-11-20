/**
 * Hand-checked EV chargers, collected province by province.
 *
 * Source: Google Maps searches (coordinates from the map pin), with charger power
 * from Saifah / PlugShare / the Google listing where one was stated. Districts are
 * assigned from the nearest district office, so they are approximate.
 * This is static data: it has no live availability and can go out of date.
 * Re-check a station in its provider app before relying on it.
 *
 * Progress per province: docs/chargers/PROVINCE_CHECKLIST.md
 */
import type { EVConnectorType } from "@/types/trip";

export type CuratedCharger = {
  id: string;
  name: string;
  brand: string;
  /** Thai province name, e.g. "ลพบุรี". */
  province: string;
  /** Thai district (amphoe) name; approximate. */
  district?: string;
  latitude: number;
  longitude: number;
  /** Fastest connector power in kW, only when a listing stated it. */
  maxChargeRateKw?: number;
  connectors?: EVConnectorType[];
  open24h?: boolean;
  /** Short Thai note shown with the station, e.g. why it needs checking. */
  note?: string;
};

export const curatedChargersCheckedAt = "2026-11-20";

/** Provinces with collected data and how many stations each has. */
export const curatedChargerProvinces: Record<string, number> = {"นครปฐม": 16, "นนทบุรี": 3, "ลพบุรี": 30, "เพชรบูรณ์": 33, "สระบุรี": 46, "นครสวรรค์": 51};

export const curatedChargers: CuratedCharger[] = [
  // นครปฐม (16)
  { id: "np-13.80700-100.32160", name: "iGreen+ EV Charging Station ศาลายา", brand: "iGreen+", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.807, longitude: 100.3216 },
  { id: "np-13.79630-100.32850", name: "EleXA ศาลายา ซอย 7", brand: "EleX by EGAT", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7963, longitude: 100.3285 },
  { id: "np-13.79290-100.32600", name: "ChargePlus ศาลายา", brand: "Charge+", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7929, longitude: 100.326, open24h: true },
  { id: "np-13.79070-100.32650", name: "Charge+ ถ.พุทธมณฑลสาย 4", brand: "Charge+", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7907, longitude: 100.3265, open24h: true },
  { id: "np-13.79080-100.32200", name: "Plux EV Station ศาลายา", brand: "Plux", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7908, longitude: 100.322, open24h: true },
  { id: "np-13.80170-100.31050", name: "EV Station PluZ ปตท.ศาลายา สาขา 1", brand: "PTT EV Station PluZ", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.8017, longitude: 100.3105 },
  { id: "np-13.78680-100.32180", name: "EleXA ถ.บรมราชชนนี", brand: "EleX by EGAT", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7868, longitude: 100.3218 },
  { id: "np-13.78890-100.34230", name: "สถานีชาร์จ EGAT ศาลายา", brand: "EleX by EGAT", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7889, longitude: 100.3423, open24h: true },
  { id: "np-13.79340-100.31210", name: "GINKA สนาม Figure & Playground", brand: "Ginka", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7934, longitude: 100.3121 },
  { id: "np-13.82610-100.31410", name: "EV Station PluZ ปตท.ศาลายา สาขา 3 (ขาเข้า)", brand: "PTT EV Station PluZ", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.8261, longitude: 100.3141 },
  { id: "np-13.79690-100.29920", name: "EVolt ศาลายา", brand: "EVolt", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7969, longitude: 100.2992 },
  { id: "np-13.80260-100.28990", name: "Gentari ศาลายา", brand: "Gentari", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.8026, longitude: 100.2899 },
  { id: "np-13.78050-100.36400", name: "MEA EV พุทธมณฑลสาย 3", brand: "MEA EV", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7805, longitude: 100.364 },
  { id: "np-13.75820-100.32910", name: "EA Anywhere พุทธมณฑลสาย 4", brand: "EA Anywhere", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.7582, longitude: 100.3291 },
  { id: "np-13.80490-100.27950", name: "EV Station PluZ ปตท.มหาสวัสดิ์", brand: "PTT EV Station PluZ", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.8049, longitude: 100.2795 },
  { id: "np-13.78700-100.27610", name: "Virta Global ศาลายา", brand: "Virta", province: "นครปฐม", district: "พุทธมณฑล", latitude: 13.787, longitude: 100.2761 },

  // นนทบุรี (3)
  { id: "nb-13.81360-100.32590", name: "สถานีชาร์จ MEA ศาลากลาง", brand: "MEA EV", province: "นนทบุรี", district: "บางกรวย", latitude: 13.8136, longitude: 100.3259 },
  { id: "nb-13.81270-100.32230", name: "EleX by EGAT ศาลากลาง", brand: "EleX by EGAT", province: "นนทบุรี", district: "บางกรวย", latitude: 13.8127, longitude: 100.3223 },
  { id: "nb-13.81280-100.32190", name: "Happy EV Charger สัมปทวน 14", brand: "Happy EV", province: "นนทบุรี", district: "บางกรวย", latitude: 13.8128, longitude: 100.3219, open24h: true },

  // ลพบุรี (30)
  { id: "lb-15.20462-101.09693", name: "สถานีชาร์จ EV SR Extra", brand: "SR Extra", province: "ลพบุรี", district: "ชัยบาดาล", latitude: 15.20462, longitude: 101.09693, open24h: true },
  { id: "lb-15.21190-101.12119", name: "MG Super Charge ลำนารายณ์", brand: "MG Super Charge", province: "ลพบุรี", district: "ชัยบาดาล", latitude: 15.2119, longitude: 101.12119, maxChargeRateKw: 50, open24h: true },
  { id: "lb-15.23004-101.12727", name: "PEA VOLTA ชัยบาดาล", brand: "PEA VOLTA", province: "ลพบุรี", district: "ชัยบาดาล", latitude: 15.23004, longitude: 101.12727, open24h: true },
  { id: "lb-15.20402-101.09334", name: "EV Station PluZ ปตท.ชัยบาดาล", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "ชัยบาดาล", latitude: 15.20402, longitude: 101.09334, open24h: true },
  { id: "lb-15.22170-101.14830", name: "EV Station PluZ ปตท.ข้าง รร.ชัยบาดาลวิทยา", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "ชัยบาดาล", latitude: 15.2217, longitude: 101.1483 },
  { id: "lb-15.20250-101.13920", name: "EV Station PluZ ปตท.ท่ามะนาว", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "ชัยบาดาล", latitude: 15.2025, longitude: 101.1392 },
  { id: "lb-14.81400-100.44652", name: "สถานีชาร์จ Charge+ ท่าวุ้ง", brand: "Charge+", province: "ลพบุรี", district: "ท่าวุ้ง", latitude: 14.814, longitude: 100.44652, open24h: true },
  { id: "lb-14.78960-100.45868", name: "EV Station PluZ ปตท.เอเชีย-พรหมบุรี", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "ท่าวุ้ง", latitude: 14.7896, longitude: 100.45868, maxChargeRateKw: 150, open24h: true },
  { id: "lb-14.76882-100.44991", name: "EA Anywhere ท่าวุ้ง", brand: "EA Anywhere", province: "ลพบุรี", district: "ท่าวุ้ง", latitude: 14.76882, longitude: 100.44991 },
  { id: "lb-14.81033-100.56871", name: "EV Station PluZ ลพบุรี (ฝั่งตะวันตก)", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "ท่าวุ้ง", latitude: 14.81033, longitude: 100.56871, open24h: true },
  { id: "lb-15.05464-100.96801", name: "สถานีชาร์จ Charge+ ถ.สระบุรี-หล่มสัก (ท่าหลวง)", brand: "Charge+", province: "ลพบุรี", district: "ท่าหลวง", latitude: 15.05464, longitude: 100.96801, open24h: true },
  { id: "lb-15.03544-100.51341", name: "สถานีชาร์จ Sino บ้านหมี่", brand: "Sino", province: "ลพบุรี", district: "บ้านหมี่", latitude: 15.03544, longitude: 100.51341, maxChargeRateKw: 120, open24h: true },
  { id: "lb-14.83620-100.90914", name: "สถานีชาร์จรถยนต์ไฟฟ้า พัฒนานิคม", brand: "อื่น ๆ/ไม่ระบุ", province: "ลพบุรี", district: "พัฒนานิคม", latitude: 14.8362, longitude: 100.90914, open24h: true },
  { id: "lb-14.80569-100.91130", name: "ChargePlus พัฒนานิคม", brand: "Charge+", province: "ลพบุรี", district: "พัฒนานิคม", latitude: 14.80569, longitude: 100.9113, open24h: true },
  { id: "lb-14.77634-100.69402", name: "สถานีชาร์จรถไฟฟ้าอาร์เจ ถ.พหลโยธิน", brand: "RJ (เอกชน)", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.77634, longitude: 100.69402, open24h: true },
  { id: "lb-14.79913-100.67223", name: "สถานีชาร์จรถยนต์ไฟฟ้า (QMXC+MV5)", brand: "อื่น ๆ/ไม่ระบุ", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.79913, longitude: 100.67223 },
  { id: "lb-14.82439-100.64985", name: "Mega EV Car ลพบุรี", brand: "Mega EV", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.82439, longitude: 100.64985 },
  { id: "lb-14.77514-100.69440", name: "EV Station PluZ โรบินสัน ลพบุรี", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.77514, longitude: 100.6944, maxChargeRateKw: 22 },
  { id: "lb-14.76474-100.71555", name: "ReverSharger BYD ศรีสมบูรณ์ ลพบุรี", brand: "ReverSharger", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.76474, longitude: 100.71555, maxChargeRateKw: 120, open24h: true },
  { id: "lb-14.76334-100.71643", name: "EA Anywhere Global House ลพบุรี", brand: "EA Anywhere", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.76334, longitude: 100.71643 },
  { id: "lb-14.81056-100.66150", name: "G-charge ซอยลพบุรีวิลล์", brand: "G-Charge", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.81056, longitude: 100.6615, maxChargeRateKw: 11, open24h: true },
  { id: "lb-14.79022-100.62680", name: "Ginka Charge Point (DC) by PJ Loft", brand: "Ginka", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.79022, longitude: 100.6268, open24h: true },
  { id: "lb-14.76991-100.70475", name: "MG Super Charge ลพบุรี ถ.พหลโยธิน", brand: "MG Super Charge", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.76991, longitude: 100.70475, maxChargeRateKw: 50, open24h: true },
  { id: "lb-14.80220-100.65300", name: "PEA VOLTA การไฟฟ้าส่วนภูมิภาค เขต 3 ลพบุรี", brand: "PEA VOLTA", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.8022, longitude: 100.653, maxChargeRateKw: 120, open24h: true },
  { id: "lb-14.79380-100.66850", name: "EV Station PluZ ปตท.ลพบุรี-ท่าศาลา", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.7938, longitude: 100.6685 },
  { id: "lb-14.76460-100.67390", name: "EV Station PluZ ปตท.เลี่ยงเมือง ลพบุรี", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.7646, longitude: 100.6739 },
  { id: "lb-14.88440-100.63170", name: "EV Station PluZ ปตท.ศูนย์การทหารปืนใหญ่", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "เมืองลพบุรี", latitude: 14.8844, longitude: 100.6317 },
  { id: "lb-15.21060-101.11980", name: "EV Station PluZ ปตท.ลำนารายณ์", brand: "PTT EV Station PluZ", province: "ลพบุรี", district: "ลำสนธิ/ชัยบาดาล", latitude: 15.2106, longitude: 101.1198 },
  { id: "lb-15.22041-100.66265", name: "Spark EV ปั๊มบางจาก P&J EV HUB ชูชื่นบริการ", brand: "Spark EV (บางจาก)", province: "ลพบุรี", district: "หนองม่วง", latitude: 15.22041, longitude: 100.66265, open24h: true },
  { id: "lb-15.22063-100.66333", name: "EleX by EGAT ชูชื่นบริการ", brand: "EleX by EGAT", province: "ลพบุรี", district: "หนองม่วง", latitude: 15.22063, longitude: 100.66333, maxChargeRateKw: 50, open24h: true },

  // เพชรบูรณ์ (33)
  { id: "pb-16.77893-101.00999", name: "สถานีชาร์จรถยนต์ไฟฟ้า เขาค้อ (98 หมู่ 14)", brand: "อื่น ๆ/ไม่ระบุ", province: "เพชรบูรณ์", district: "เขาค้อ", latitude: 16.77893, longitude: 101.00999, maxChargeRateKw: 22, open24h: true },
  { id: "pb-16.63564-100.99620", name: "ChargePlus เขาค้อ", brand: "Charge+", province: "เพชรบูรณ์", district: "เขาค้อ", latitude: 16.63564, longitude: 100.9962, open24h: true },
  { id: "pb-16.67999-101.02305", name: "สถานีชาร์จ EGAT เขาค้อ", brand: "EleX by EGAT", province: "เพชรบูรณ์", district: "เขาค้อ", latitude: 16.67999, longitude: 101.02305, maxChargeRateKw: 90, open24h: true },
  { id: "pb-16.64908-100.99486", name: "Plux EV Station เขาค้อ (155)", brand: "Plux", province: "เพชรบูรณ์", district: "เขาค้อ", latitude: 16.64908, longitude: 100.99486, maxChargeRateKw: 22, open24h: true },
  { id: "pb-16.71328-101.03343", name: "Plux EV Station เขาค้อ (267)", brand: "Plux", province: "เพชรบูรณ์", district: "เขาค้อ", latitude: 16.71328, longitude: 101.03343, maxChargeRateKw: 22, open24h: true },
  { id: "pb-16.79243-101.03999", name: "Plux EV Station เขาค้อ (264)", brand: "Plux", province: "เพชรบูรณ์", district: "เขาค้อ", latitude: 16.79243, longitude: 101.03999, maxChargeRateKw: 22, open24h: true },
  { id: "pb-16.26191-101.04841", name: "Spark EV ปั๊มบางจาก (ใต้เมืองเพชรบูรณ์)", brand: "Spark EV (บางจาก)", province: "เพชรบูรณ์", district: "ชนแดน", latitude: 16.26191, longitude: 101.04841 },
  { id: "pb-16.88089-101.87989", name: "สถานีชาร์จรถยนต์ไฟฟ้า น้ำหนาว", brand: "อื่น ๆ/ไม่ระบุ", province: "เพชรบูรณ์", district: "น้ำหนาว", latitude: 16.88089, longitude: 101.87989 },
  { id: "pb-15.79311-101.00614", name: "Altervim โลตัส บึงสามพัน", brand: "Altervim", province: "เพชรบูรณ์", district: "บึงสามพัน", latitude: 15.79311, longitude: 101.00614, open24h: true },
  { id: "pb-15.81143-101.00746", name: "PEA VOLTA บึงสามพัน", brand: "PEA VOLTA", province: "เพชรบูรณ์", district: "บึงสามพัน", latitude: 15.81143, longitude: 101.00746, open24h: true },
  { id: "pb-16.42370-101.16240", name: "PEA VOLTA การไฟฟ้าส่วนภูมิภาค จ.เพชรบูรณ์", brand: "PEA VOLTA", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.4237, longitude: 101.1624, note: "ยังไม่ยืนยันว่ามีที่ชาร์จ เช็คในแอป PEA VOLTA ก่อน" },
  { id: "pb-16.53187-101.15666", name: "Charge+ นางั่ว", brand: "Charge+", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.53187, longitude: 101.15666, open24h: true },
  { id: "pb-16.45424-101.15133", name: "ChargePlus เพชรบูรณ์ (ใกล้ ม.ราชภัฏ)", brand: "Charge+", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.45424, longitude: 101.15133, open24h: true },
  { id: "pb-16.45198-101.15286", name: "EleX by EGAT ม.ราชภัฏเพชรบูรณ์ (PCRU)", brand: "EleX by EGAT", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.45198, longitude: 101.15286, maxChargeRateKw: 100 },
  { id: "pb-16.38400-101.12315", name: "ReverSharger BYD ศรีสมบูรณ์ เพชรบูรณ์", brand: "ReverSharger", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.384, longitude: 101.12315, maxChargeRateKw: 120, open24h: true },
  { id: "pb-16.36690-101.10909", name: "MG Super Charge มิตรศิลป์ ถ.คชเสนีย์", brand: "MG Super Charge", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.3669, longitude: 101.10909, maxChargeRateKw: 120, open24h: true },
  { id: "pb-16.38712-101.12722", name: "EV Station PluZ ปตท.บ้านพี้", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.38712, longitude: 101.12722 },
  { id: "pb-16.45329-101.15318", name: "EV Station PluZ ปตท.สวัสดิการ ม.ราชภัฏเพชรบูรณ์", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.45329, longitude: 101.15318, maxChargeRateKw: 120 },
  { id: "pb-16.49990-101.15690", name: "EV Station PluZ ปตท.นางั่ว", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.4999, longitude: 101.1569 },
  { id: "pb-16.38300-101.12200", name: "EV Station PluZ ปตท.เมืองเพชรบูรณ์", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "เมืองเพชรบูรณ์", latitude: 16.383, longitude: 101.122 },
  { id: "pb-15.59984-101.06460", name: "EleX by EGAT วิเชียรบุรี", brand: "EleX by EGAT", province: "เพชรบูรณ์", district: "วิเชียรบุรี", latitude: 15.59984, longitude: 101.0646, open24h: true },
  { id: "pb-15.44617-101.06882", name: "EV Station PluZ ศรีเทพ (โคกสะอาด)", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "ศรีเทพ", latitude: 15.44617, longitude: 101.06882 },
  { id: "pb-15.99519-101.06504", name: "PEA VOLTA หนองไผ่", brand: "PEA VOLTA", province: "เพชรบูรณ์", district: "หนองไผ่", latitude: 15.99519, longitude: 101.06504 },
  { id: "pb-16.15519-101.06438", name: "Blue Mountains สถานีชาร์จรถไฟฟ้า", brand: "อื่น ๆ/ไม่ระบุ", province: "เพชรบูรณ์", district: "หนองไผ่", latitude: 16.15519, longitude: 101.06438 },
  { id: "pb-16.75870-101.19438", name: "Spark EV ปั๊มบางจากพ่อขุนผาเมือง", brand: "Spark EV (บางจาก)", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.7587, longitude: 101.19438, open24h: true },
  { id: "pb-16.78773-101.23948", name: "Altervim โลตัส หล่มสัก", brand: "Altervim", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.78773, longitude: 101.23948, maxChargeRateKw: 120, open24h: true },
  { id: "pb-16.73861-101.22718", name: "EleXA หล่มสัก (ปั๊ม PT)", brand: "EleX by EGAT", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.73861, longitude: 101.22718, maxChargeRateKw: 125 },
  { id: "pb-16.72825-101.29208", name: "GINKA หล่มสัก (40/1)", brand: "Ginka", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.72825, longitude: 101.29208, open24h: true },
  { id: "pb-16.77910-101.23549", name: "GINKA หล่มสัก", brand: "Ginka", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.7791, longitude: 101.23549, open24h: true },
  { id: "pb-16.71563-101.18174", name: "EV Station PluZ หล่มสัก ถ.สระบุรี-หล่มสัก", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.71563, longitude: 101.18174, open24h: true },
  { id: "pb-16.75685-101.19709", name: "EV Station PluZ บ้านกกโอ", brand: "PTT EV Station PluZ", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.75685, longitude: 101.19709, open24h: true },
  { id: "pb-16.76064-101.21649", name: "PEA VOLTA หล่มสัก", brand: "PEA VOLTA", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.76064, longitude: 101.21649, maxChargeRateKw: 50 },
  { id: "pb-16.75565-101.20046", name: "Tesla Supercharger หล่มสัก", brand: "Tesla", province: "เพชรบูรณ์", district: "หล่มสัก", latitude: 16.75565, longitude: 101.20046, maxChargeRateKw: 250, open24h: true },

  // สระบุรี (46)
  { id: "sb-14.59634-101.08221", name: "Charge+ แก่งคอย", brand: "Charge+", province: "สระบุรี", district: "แก่งคอย", latitude: 14.59634, longitude: 101.08221, open24h: true },
  { id: "sb-14.62104-101.09089", name: "ChargePlus ทับกวาง", brand: "Charge+", province: "สระบุรี", district: "แก่งคอย", latitude: 14.62104, longitude: 101.09089, open24h: true },
  { id: "sb-14.64998-100.97295", name: "EVolt แก่งคอย", brand: "EVolt", province: "สระบุรี", district: "แก่งคอย", latitude: 14.64998, longitude: 100.97295, maxChargeRateKw: 22, open24h: true },
  { id: "sb-14.55746-100.96971", name: "OneCharge Diamond cafe", brand: "OneCharge", province: "สระบุรี", district: "แก่งคอย", latitude: 14.55746, longitude: 100.96971, open24h: true },
  { id: "sb-14.57351-100.98705", name: "PEA VOLTA ถ.มิตรภาพ แก่งคอย", brand: "PEA VOLTA", province: "สระบุรี", district: "แก่งคอย", latitude: 14.57351, longitude: 100.98705 },
  { id: "sb-14.56081-100.97269", name: "ReverSharger ต.เตาปูน ถ.มิตรภาพ", brand: "ReverSharger", province: "สระบุรี", district: "แก่งคอย", latitude: 14.56081, longitude: 100.97269, maxChargeRateKw: 120, open24h: true },
  { id: "sb-14.57562-100.99499", name: "ReverSharger แก่งคอย (155)", brand: "ReverSharger", province: "สระบุรี", district: "แก่งคอย", latitude: 14.57562, longitude: 100.99499, maxChargeRateKw: 120, open24h: true },
  { id: "sb-14.55365-100.96588", name: "EV Station PluZ Saraburi Hub", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "แก่งคอย", latitude: 14.55365, longitude: 100.96588 },
  { id: "sb-14.62184-101.09266", name: "EV Station PluZ ปตท.ทับกวาง", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "แก่งคอย", latitude: 14.62184, longitude: 101.09266, open24h: true },
  { id: "sb-14.62726-100.89038", name: "EleXA เฉลิมพระเกียรติ ถ.พหลโยธิน", brand: "EleX by EGAT", province: "สระบุรี", district: "เฉลิมพระเกียรติ", latitude: 14.62726, longitude: 100.89038, open24h: true },
  { id: "sb-14.69462-100.86731", name: "Spark EV ปั๊มบางจาก ป.ฟ้าใสเซอร์วิส", brand: "Spark EV (บางจาก)", province: "สระบุรี", district: "พระพุทธบาท", latitude: 14.69462, longitude: 100.86731, open24h: true },
  { id: "sb-14.69467-100.86738", name: "EA Anywhere นาพระลาน", brand: "EA Anywhere", province: "สระบุรี", district: "พระพุทธบาท", latitude: 14.69467, longitude: 100.86738 },
  { id: "sb-14.60030-101.20687", name: "สถานีชาร์จรถยนต์ไฟฟ้า มวกเหล็ก (J624+4PH)", brand: "อื่น ๆ/ไม่ระบุ", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.6003, longitude: 101.20687 },
  { id: "sb-14.65619-101.19716", name: "สถานีชาร์จรถยนต์ไฟฟ้า มวกเหล็ก", brand: "อื่น ๆ/ไม่ระบุ", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.65619, longitude: 101.19716 },
  { id: "sb-14.63510-101.20942", name: "Charge+ มวกเหล็ก", brand: "Charge+", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.6351, longitude: 101.20942, open24h: true },
  { id: "sb-14.63014-101.17121", name: "PEA VOLTA มวกเหล็ก", brand: "PEA VOLTA", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.63014, longitude: 101.17121, open24h: true },
  { id: "sb-14.65499-101.31729", name: "EV Station PluZ กลางดง", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.65499, longitude: 101.31729, open24h: true },
  { id: "sb-14.62796-101.17800", name: "TPI Polene ถ.มิตรภาพ (90 หมู่ 10)", brand: "TPI Polene Power", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.62796, longitude: 101.178 },
  { id: "sb-14.63810-101.13410", name: "TPI Polene Power ถ.มิตรภาพ", brand: "TPI Polene Power", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.6381, longitude: 101.1341, open24h: true },
  { id: "sb-14.63940-101.13490", name: "TPIPP EV Charger Station", brand: "TPI Polene Power", province: "สระบุรี", district: "มวกเหล็ก", latitude: 14.6394, longitude: 101.1349, open24h: true },
  { id: "sb-14.54768-100.89149", name: "Spark EV ปั๊มบางจาก เกตุพิชัย", brand: "Spark EV (บางจาก)", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54768, longitude: 100.89149, open24h: true },
  { id: "sb-14.55980-100.90256", name: "สถานีชาร์จรถยนต์ไฟฟ้า เมืองสระบุรี (59)", brand: "อื่น ๆ/ไม่ระบุ", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.5598, longitude: 100.90256 },
  { id: "sb-14.52111-100.92300", name: "Altervim โลตัส สระบุรี", brand: "Altervim", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.52111, longitude: 100.923, open24h: true },
  { id: "sb-14.46122-100.92327", name: "EA Anywhere หนองปลาไหล", brand: "EA Anywhere", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.46122, longitude: 100.92327 },
  { id: "sb-14.54002-100.95097", name: "EA Anywhere โรบินสัน สระบุรี", brand: "EA Anywhere", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54002, longitude: 100.95097, maxChargeRateKw: 40 },
  { id: "sb-14.56145-100.92242", name: "EV Car จุดชาร์จรถไฟฟ้า ผึ้งรวง 3", brand: "อื่น ๆ/ไม่ระบุ", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.56145, longitude: 100.92242, open24h: true },
  { id: "sb-14.45927-100.91919", name: "EVolt สระบุรี", brand: "EVolt", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.45927, longitude: 100.91919, open24h: true },
  { id: "sb-14.46380-100.90579", name: "Gentari สระบุรี", brand: "Gentari", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.4638, longitude: 100.90579, maxChargeRateKw: 120, open24h: true },
  { id: "sb-14.54038-100.95254", name: "EV Station PluZ ถ.มิตรภาพ (โรบินสัน)", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54038, longitude: 100.95254 },
  { id: "sb-14.52609-100.93419", name: "Pure สระบุรี", brand: "Pure", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.52609, longitude: 100.93419, open24h: true },
  { id: "sb-14.49072-100.91520", name: "ReverSharger สระบุรี (88)", brand: "ReverSharger", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.49072, longitude: 100.9152, maxChargeRateKw: 120, open24h: true },
  { id: "sb-14.54756-100.89108", name: "ReverSharger ถ.เทศบาล 5", brand: "ReverSharger", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54756, longitude: 100.89108, open24h: true },
  { id: "sb-14.48141-100.91217", name: "MG Super Charge สระบุรี ถ.พหลโยธิน", brand: "MG Super Charge", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.48141, longitude: 100.91217, open24h: true },
  { id: "sb-14.54915-100.93872", name: "MG Super Charge สระบุรี (111)", brand: "MG Super Charge", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54915, longitude: 100.93872, open24h: true },
  { id: "sb-14.54485-100.88763", name: "EV Station PluZ ปตท.บายพาสสระบุรี", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54485, longitude: 100.88763, open24h: true },
  { id: "sb-14.54008-100.95224", name: "Tesla Supercharger สระบุรี", brand: "Tesla", province: "สระบุรี", district: "เมืองสระบุรี", latitude: 14.54008, longitude: 100.95224, open24h: true },
  { id: "sb-14.86458-101.14615", name: "GINKA ดองกี้ฟาร์มแอนด์แคมป์", brand: "Ginka", province: "สระบุรี", district: "วังม่วง", latitude: 14.86458, longitude: 101.14615 },
  { id: "sb-14.37907-100.95668", name: "Spark EV ปั๊มบางจาก วิหารแดง", brand: "Spark EV (บางจาก)", province: "สระบุรี", district: "วิหารแดง", latitude: 14.37907, longitude: 100.95668, open24h: true },
  { id: "sb-14.32425-101.01034", name: "PEA VOLTA สำนักงาน กฟภ.วิหารแดง", brand: "PEA VOLTA", province: "สระบุรี", district: "วิหารแดง", latitude: 14.32425, longitude: 101.01034, note: "เป็นสำนักงาน PEA ยังไม่ยืนยันว่าเปิดให้คนทั่วไปชาร์จ" },
  { id: "sb-14.35969-100.87737", name: "Charge+ หนองแค", brand: "Charge+", province: "สระบุรี", district: "หนองแค", latitude: 14.35969, longitude: 100.87737, open24h: true },
  { id: "sb-14.38468-100.89284", name: "EleX by EGAT หนองแค", brand: "EleX by EGAT", province: "สระบุรี", district: "หนองแค", latitude: 14.38468, longitude: 100.89284, maxChargeRateKw: 100, open24h: true },
  { id: "sb-14.28878-100.81718", name: "EV Station PluZ หนองแค (ใต้)", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "หนองแค", latitude: 14.28878, longitude: 100.81718, maxChargeRateKw: 50, open24h: true, note: "ใกล้รอยต่ออยุธยา (วังน้อย)" },
  { id: "sb-14.31912-100.83832", name: "EV Station PluZ หนองแค", brand: "PTT EV Station PluZ", province: "สระบุรี", district: "หนองแค", latitude: 14.31912, longitude: 100.83832 },
  { id: "sb-14.41526-100.89149", name: "Spark EV บางจาก หนองแค", brand: "Spark EV (บางจาก)", province: "สระบุรี", district: "หนองแค", latitude: 14.41526, longitude: 100.89149, open24h: true },
  { id: "sb-14.34583-100.85959", name: "ERGE หนองแค", brand: "ERGE", province: "สระบุรี", district: "หนองแค", latitude: 14.34583, longitude: 100.85959, open24h: true },
  { id: "sb-14.41640-100.80513", name: "EA Anywhere หนองแซง", brand: "EA Anywhere", province: "สระบุรี", district: "หนองแซง", latitude: 14.4164, longitude: 100.80513, maxChargeRateKw: 22, open24h: true },

  // นครสวรรค์ (51)
  { id: "ns-15.78403-99.97087", name: "ChargePlus เก้าเลี้ยว", brand: "Charge+", province: "นครสวรรค์", district: "เก้าเลี้ยว", latitude: 15.78403, longitude: 99.97087, open24h: true },
  { id: "ns-15.98168-100.11866", name: "EleX by EGAT (X4J9+MFF)", brand: "EleX by EGAT", province: "นครสวรรค์", district: "ชุมแสง/บรรพตพิสัย", latitude: 15.98168, longitude: 100.11866, open24h: true, note: "อำเภอไม่แน่นอน" },
  { id: "ns-15.77664-99.97972", name: "JSW EV Hub", brand: "JSW (เอกชน)", province: "นครสวรรค์", district: "เก้าเลี้ยว", latitude: 15.77664, longitude: 99.97972 },
  { id: "ns-15.77007-99.98584", name: "Maekulap EV Station แม่กุหลาบ หนองเบน", brand: "Maekulap (เอกชน)", province: "นครสวรรค์", district: "เก้าเลี้ยว", latitude: 15.77007, longitude: 99.98584, open24h: true },
  { id: "ns-15.83069-100.11841", name: "EV Station PluZ บ้านหมากเสีย", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "เก้าเลี้ยว", latitude: 15.83069, longitude: 100.11841 },
  { id: "ns-15.76137-99.99297", name: "Spark EV เก้าเลี้ยว", brand: "Spark EV (บางจาก)", province: "นครสวรรค์", district: "เก้าเลี้ยว", latitude: 15.76137, longitude: 99.99297, open24h: true },
  { id: "ns-15.74979-100.00432", name: "WS EV charger by EleX app", brand: "EleX by EGAT", province: "นครสวรรค์", district: "เก้าเลี้ยว", latitude: 15.74979, longitude: 100.00432, open24h: true },
  { id: "ns-15.57285-100.12602", name: "EleXA โกรกพระ ถ.พหลโยธิน", brand: "EleX by EGAT", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.57285, longitude: 100.12602, maxChargeRateKw: 150, open24h: true },
  { id: "ns-15.57261-100.12599", name: "PEA VOLTA โกรกพระ", brand: "PEA VOLTA", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.57261, longitude: 100.12599, open24h: true },
  { id: "ns-15.57708-100.12358", name: "EV Station PluZ โกรกพระ (H4GF+RCP)", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.57708, longitude: 100.12358, open24h: true },
  { id: "ns-15.57794-100.12589", name: "EV Station PluZ โกรกพระ (17 ถ.พหลโยธิน)", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.57794, longitude: 100.12589 },
  { id: "ns-15.54634-100.12730", name: "Shell Recharge โกรกพระ", brand: "Shell Recharge", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.54634, longitude: 100.1273, maxChargeRateKw: 180, open24h: true },
  { id: "ns-15.54617-100.12751", name: "ReverSharger (SHARGE) โกรกพระ", brand: "ReverSharger", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.54617, longitude: 100.12751, open24h: true },
  { id: "ns-15.58485-100.12430", name: "Ultra Charge EV Station นครสวรรค์", brand: "Ultra Charge", province: "นครสวรรค์", district: "โกรกพระ", latitude: 15.58485, longitude: 100.1243, open24h: true },
  { id: "ns-15.86733-100.27709", name: "ชุมแสง EV", brand: "อื่น ๆ/ไม่ระบุ", province: "นครสวรรค์", district: "ชุมแสง", latitude: 15.86733, longitude: 100.27709, open24h: true },
  { id: "ns-15.87198-100.27220", name: "GINKA โรงแรมดีเทล ชุมแสง", brand: "Ginka", province: "นครสวรรค์", district: "ชุมแสง", latitude: 15.87198, longitude: 100.2722, open24h: true },
  { id: "ns-15.37611-100.24855", name: "JM EV Charge (PEA VOLTA Connext) ตาคลี", brand: "PEA VOLTA", province: "นครสวรรค์", district: "ตาคลี", latitude: 15.37611, longitude: 100.24855, open24h: true },
  { id: "ns-15.26175-100.33016", name: "EleX by EGAT EV TiGeR ตาคลี", brand: "EleX by EGAT", province: "นครสวรรค์", district: "ตาคลี", latitude: 15.26175, longitude: 100.33016 },
  { id: "ns-15.16596-100.43693", name: "EV charger station กุหลาบคอฟฟี่", brand: "กุหลาบคอฟฟี่ (เอกชน)", province: "นครสวรรค์", district: "ตาคลี", latitude: 15.16596, longitude: 100.43693, open24h: true, note: "ใกล้รอยต่อลพบุรี/ชัยนาท" },
  { id: "ns-16.11914-100.12689", name: "EV Station PluZ (126)", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "บรรพตพิสัย", latitude: 16.11914, longitude: 100.12689, open24h: true, note: "ใกล้รอยต่อจังหวัด อาจเป็นพิจิตร" },
  { id: "ns-15.87213-99.91007", name: "Plux EV Station บรรพตพิสัย", brand: "Plux", province: "นครสวรรค์", district: "บรรพตพิสัย", latitude: 15.87213, longitude: 99.91007, maxChargeRateKw: 22, open24h: true },
  { id: "ns-15.81570-99.94254", name: "EV Station PluZ บรรพตพิสัย ถ.พหลโยธิน", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "บรรพตพิสัย", latitude: 15.8157, longitude: 99.94254 },
  { id: "ns-15.49868-100.12816", name: "Spark EV ปั๊มบางจาก สหกรณ์ฯ พยุหะคีรี", brand: "Spark EV (บางจาก)", province: "นครสวรรค์", district: "พยุหะคีรี", latitude: 15.49868, longitude: 100.12816, open24h: true },
  { id: "ns-15.39730-100.14778", name: "Charge+ ปั๊ม PT เขาไม้เดน", brand: "Charge+", province: "นครสวรรค์", district: "พยุหะคีรี", latitude: 15.3973, longitude: 100.14778, open24h: true },
  { id: "ns-15.39730-100.14779", name: "EleX by EGAT ปั๊ม PT เขาไม้เดน", brand: "EleX by EGAT", province: "นครสวรรค์", district: "พยุหะคีรี", latitude: 15.3973, longitude: 100.14779, open24h: true },
  { id: "ns-15.48265-100.13521", name: "NEXMOEV พยุหะคีรี", brand: "NEXMOEV", province: "นครสวรรค์", district: "พยุหะคีรี", latitude: 15.48265, longitude: 100.13521, open24h: true },
  { id: "ns-15.72968-100.03686", name: "Spark EV ปั๊มบางจาก หนองกรด (ขาเข้า)", brand: "Spark EV (บางจาก)", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.72968, longitude: 100.03686, open24h: true },
  { id: "ns-15.72061-100.05209", name: "Spark EV ปั๊มบางจาก สหกรณ์ฯ เมืองนครสวรรค์", brand: "Spark EV (บางจาก)", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.72061, longitude: 100.05209, maxChargeRateKw: 22, open24h: true },
  { id: "ns-15.70789-100.09469", name: "Altervim โลตัส นครสวรรค์", brand: "Altervim", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70789, longitude: 100.09469, open24h: true },
  { id: "ns-15.69761-100.11957", name: "EA Anywhere นครสวรรค์ (1016)", brand: "EA Anywhere", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.69761, longitude: 100.11957, maxChargeRateKw: 150, open24h: true },
  { id: "ns-15.71646-100.11805", name: "EA Anywhere นครสวรรค์ (หมู่ 10)", brand: "EA Anywhere", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.71646, longitude: 100.11805, maxChargeRateKw: 22, open24h: true },
  { id: "ns-15.77484-100.12176", name: "EA Anywhere ถ.นครสวรรค์-พิษณุโลก", brand: "EA Anywhere", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.77484, longitude: 100.12176, maxChargeRateKw: 50 },
  { id: "ns-15.70272-100.11729", name: "EVolt นครสวรรค์", brand: "EVolt", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70272, longitude: 100.11729, maxChargeRateKw: 7, open24h: true },
  { id: "ns-15.72807-100.03783", name: "EVolt AH1 นครสวรรค์", brand: "EVolt", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.72807, longitude: 100.03783, open24h: true },
  { id: "ns-15.74191-100.12086", name: "Gentari นครสวรรค์", brand: "Gentari", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.74191, longitude: 100.12086, maxChargeRateKw: 120, open24h: true },
  { id: "ns-15.68382-100.06004", name: "GINKA Drive Golf นครสวรรค์", brand: "Ginka", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.68382, longitude: 100.06004, open24h: true },
  { id: "ns-15.69409-100.12473", name: "สถานีชาร์จ Nissan นครสวรรค์", brand: "Nissan (ศูนย์รถ)", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.69409, longitude: 100.12473, open24h: true },
  { id: "ns-15.70965-100.11540", name: "PEA VOLTA นครสวรรค์", brand: "PEA VOLTA", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70965, longitude: 100.1154 },
  { id: "ns-15.71761-100.11816", name: "Plux EV Station นครสวรรค์", brand: "Plux", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.71761, longitude: 100.11816, maxChargeRateKw: 22, open24h: true },
  { id: "ns-15.63172-100.12941", name: "EV Station PluZ บ้านตลาดไท", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.63172, longitude: 100.12941, open24h: true },
  { id: "ns-15.70791-100.14294", name: "EV Station PluZ นครสวรรค์ (ตะวันออก)", brand: "PTT EV Station PluZ", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70791, longitude: 100.14294, note: "ที่อยู่ใน Google ไม่ตรงพิกัด" },
  { id: "ns-15.62732-100.12629", name: "ReverSharger ตลาดไท", brand: "ReverSharger", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.62732, longitude: 100.12629, maxChargeRateKw: 120, open24h: true },
  { id: "ns-15.70994-100.11794", name: "ReverSharger นครสวรรค์ (816)", brand: "ReverSharger", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70994, longitude: 100.11794, maxChargeRateKw: 120, open24h: true },
  { id: "ns-15.70762-100.08763", name: "Spark EV นครสวรรค์ ถ.พหลโยธิน", brand: "Spark EV (บางจาก)", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70762, longitude: 100.08763, open24h: true },
  { id: "ns-15.73096-100.11644", name: "EA Anywhere นครสวรรค์ (234)", brand: "EA Anywhere", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.73096, longitude: 100.11644, open24h: true },
  { id: "ns-15.73691-100.11871", name: "EA Anywhere ไอเดีย เฟอร์นิเจอร์ มอลล์", brand: "EA Anywhere", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.73691, longitude: 100.11871, open24h: true },
  { id: "ns-15.74965-100.12191", name: "EA Anywhere Caltex ไพศาล", brand: "EA Anywhere", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.74965, longitude: 100.12191, maxChargeRateKw: 50, open24h: true },
  { id: "ns-15.64001-100.13327", name: "MG Super Charge บ้านตลาดไท", brand: "MG Super Charge", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.64001, longitude: 100.13327, maxChargeRateKw: 50, open24h: true },
  { id: "ns-15.70061-100.12104", name: "MG Super Charge ถ.นครสวรรค์-พิษณุโลก", brand: "MG Super Charge", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.70061, longitude: 100.12104, open24h: true },
  { id: "ns-15.71141-100.05610", name: "Tesla Supercharger นครสวรรค์", brand: "Tesla", province: "นครสวรรค์", district: "เมืองนครสวรรค์", latitude: 15.71141, longitude: 100.0561, open24h: true },
  { id: "ns-15.84461-100.60501", name: "EleX by EGAT หนองบัว (สาย 11)", brand: "EleX by EGAT", province: "นครสวรรค์", district: "หนองบัว", latitude: 15.84461, longitude: 100.60501, open24h: true },
];
