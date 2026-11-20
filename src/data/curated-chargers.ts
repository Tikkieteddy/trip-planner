/**
 * Hand-checked EV chargers for zones where Google Places results were thin.
 *
 * Source: Google Maps searches done on 2026-11-20 (coordinates from the map pin),
 * with charger power from Saifah / PlugShare listings where one was found.
 * This is static data: it has no live availability and can go out of date.
 * Re-check a station in its provider app before relying on it.
 */
import type { EVConnectorType } from "@/types/trip";

export type CuratedChargerZone =
  | "salaya"
  | "lopburi-tha-luang"
  | "lopburi-mueang"
  | "phetchabun-mueang";

export type CuratedCharger = {
  id: string;
  name: string;
  brand: string;
  zone: CuratedChargerZone;
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

export const curatedChargerZoneLabels: Record<CuratedChargerZone, string> = {
  salaya: "ศาลากลาง (บางกรวย) / ศาลายา",
  "lopburi-tha-luang": "ลพบุรี: บ้านไม้หอม กะเพรา 25 บาท (อ.ท่าหลวง) / ชัยบาดาล",
  "lopburi-mueang": "ลพบุรี: ครัวไม้หอม (อ.เมือง)",
  "phetchabun-mueang": "เพชรบูรณ์: LAFIN / Livist Resort / ก่อนขึ้นเขาค้อ-ภูทับเบิก",
};

const ccs: EVConnectorType[] = ["EV_CONNECTOR_TYPE_CCS_COMBO_2"];
const ccsType2: EVConnectorType[] = ["EV_CONNECTOR_TYPE_CCS_COMBO_2", "EV_CONNECTOR_TYPE_TYPE_2"];

export const curatedChargers: CuratedCharger[] = [
  // ศาลากลาง (บางกรวย) / ศาลายา
  { id: "salaya-igreen-19", name: "iGreen+ EV Charging Station ศาลายา", brand: "iGreen+", zone: "salaya", latitude: 13.807, longitude: 100.3216 },
  { id: "salaya-mea-salaklang", name: "สถานีชาร์จ MEA ศาลากลาง", brand: "MEA EV", zone: "salaya", latitude: 13.8136, longitude: 100.3259 },
  { id: "salaya-elexa-soi7", name: "EleXA ศาลายา ซอย 7", brand: "EleX by EGAT", zone: "salaya", latitude: 13.7963, longitude: 100.3285 },
  { id: "salaya-elex-egat", name: "EleX by EGAT ศาลากลาง", brand: "EleX by EGAT", zone: "salaya", latitude: 13.8127, longitude: 100.3223 },
  { id: "salaya-happy-ev", name: "Happy EV Charger สัมปทวน 14", brand: "Happy EV", zone: "salaya", latitude: 13.8128, longitude: 100.3219, open24h: true },
  { id: "salaya-chargeplus-1", name: "ChargePlus ศาลายา", brand: "Charge+", zone: "salaya", latitude: 13.7929, longitude: 100.326, open24h: true },
  { id: "salaya-chargeplus-sai4", name: "Charge+ ถ.พุทธมณฑลสาย 4", brand: "Charge+", zone: "salaya", latitude: 13.7907, longitude: 100.3265, open24h: true },
  { id: "salaya-plux", name: "Plux EV Station ศาลายา", brand: "Plux", zone: "salaya", latitude: 13.7908, longitude: 100.322, open24h: true },
  { id: "salaya-ptt-1", name: "EV Station PluZ ปตท.ศาลายา สาขา 1", brand: "PTT EV Station PluZ", zone: "salaya", latitude: 13.8017, longitude: 100.3105 },
  { id: "salaya-elexa-borommaratchachonnani", name: "EleXA ถ.บรมราชชนนี", brand: "EleX by EGAT", zone: "salaya", latitude: 13.7868, longitude: 100.3218 },
  { id: "salaya-egat-q8qr", name: "สถานีชาร์จ EGAT ศาลายา", brand: "EleX by EGAT", zone: "salaya", latitude: 13.7889, longitude: 100.3423, open24h: true },
  { id: "salaya-ginka", name: "GINKA สนาม Figure & Playground", brand: "Ginka", zone: "salaya", latitude: 13.7934, longitude: 100.3121 },
  { id: "salaya-ptt-3", name: "EV Station PluZ ปตท.ศาลายา สาขา 3 (ขาเข้า)", brand: "PTT EV Station PluZ", zone: "salaya", latitude: 13.8261, longitude: 100.3141 },
  { id: "salaya-evolt", name: "EVolt ศาลายา", brand: "EVolt", zone: "salaya", latitude: 13.7969, longitude: 100.2992 },
  { id: "salaya-gentari", name: "Gentari ศาลายา", brand: "Gentari", zone: "salaya", latitude: 13.8026, longitude: 100.2899 },
  { id: "salaya-mea-sai3", name: "MEA EV พุทธมณฑลสาย 3", brand: "MEA EV", zone: "salaya", latitude: 13.7805, longitude: 100.364 },
  { id: "salaya-ea-sai4", name: "EA Anywhere พุทธมณฑลสาย 4", brand: "EA Anywhere", zone: "salaya", latitude: 13.7582, longitude: 100.3291 },
  { id: "salaya-ptt-mahasawat", name: "EV Station PluZ ปตท.มหาสวัสดิ์", brand: "PTT EV Station PluZ", zone: "salaya", latitude: 13.8049, longitude: 100.2795 },
  { id: "salaya-virta", name: "Virta Global ศาลายา", brand: "Virta", zone: "salaya", latitude: 13.787, longitude: 100.2761 },

  // ลพบุรี: บ้านไม้หอม กะเพรา 25 บาท (อ.ท่าหลวง) — nearest chargers are 11-15 km away in ชัยบาดาล/ลำนารายณ์
  { id: "tl-ptt-thamanao", name: "EV Station PluZ ปตท.ท่ามะนาว", brand: "PTT EV Station PluZ", zone: "lopburi-tha-luang", latitude: 15.2025, longitude: 101.1392 },
  { id: "tl-ptt-chaibadan-school", name: "EV Station PluZ ปตท.ข้าง รร.ชัยบาดาลวิทยา", brand: "PTT EV Station PluZ", zone: "lopburi-tha-luang", latitude: 15.2217, longitude: 101.1483 },
  { id: "tl-ptt-lamnarai", name: "EV Station PluZ ปตท.ลำนารายณ์", brand: "PTT EV Station PluZ", zone: "lopburi-tha-luang", latitude: 15.2106, longitude: 101.1198 },
  { id: "tl-mg-lamnarai", name: "MG Super Charge ลำนารายณ์", brand: "MG Super Charge", zone: "lopburi-tha-luang", latitude: 15.2119, longitude: 101.1211, maxChargeRateKw: 50, connectors: ccs },
  { id: "tl-pea-360hub", name: "PEA VOLTA EV 360Hub ชัยบาดาล", brand: "PEA VOLTA", zone: "lopburi-tha-luang", latitude: 15.2303, longitude: 101.1271, open24h: true },
  { id: "tl-sr-extra", name: "สถานีชาร์จ EV SR Extra", brand: "SR Extra", zone: "lopburi-tha-luang", latitude: 15.2046, longitude: 101.0969, open24h: true },
  { id: "tl-ptt-chaibadan", name: "EV Station PluZ ปตท.ชัยบาดาล", brand: "PTT EV Station PluZ", zone: "lopburi-tha-luang", latitude: 15.2038, longitude: 101.0936 },

  // ลพบุรี: ครัวไม้หอม (อ.เมือง)
  { id: "lb-pea-zone3", name: "PEA VOLTA การไฟฟ้าส่วนภูมิภาค เขต 3 ลพบุรี", brand: "PEA VOLTA", zone: "lopburi-mueang", latitude: 14.8022, longitude: 100.653, maxChargeRateKw: 120, connectors: ccs, open24h: true },
  { id: "lb-ptt-thasala", name: "EV Station PluZ ปตท.ลพบุรี-ท่าศาลา", brand: "PTT EV Station PluZ", zone: "lopburi-mueang", latitude: 14.7938, longitude: 100.6685 },
  { id: "lb-ginka-pjloft", name: "Ginka Charge Point (DC) by PJ Loft", brand: "Ginka", zone: "lopburi-mueang", latitude: 14.7902, longitude: 100.6268 },
  { id: "lb-gcharge", name: "G-charge ซอยลพบุรีวิลล์", brand: "G-charge", zone: "lopburi-mueang", latitude: 14.8105, longitude: 100.6615 },
  { id: "lb-mega-ev", name: "Mega EV Car ลพบุรี", brand: "Mega EV", zone: "lopburi-mueang", latitude: 14.8243, longitude: 100.6498 },
  { id: "lb-rj", name: "สถานีชาร์จรถไฟฟ้าอาร์เจ ถ.พหลโยธิน", brand: "RJ (เอกชน)", zone: "lopburi-mueang", latitude: 14.7763, longitude: 100.694 },
  { id: "lb-robinson", name: "สถานีชาร์จ โรบินสัน ลพบุรี", brand: "PTT EV / EA Anywhere", zone: "lopburi-mueang", latitude: 14.7751, longitude: 100.6944 },
  { id: "lb-ptt-bypass", name: "EV Station PluZ ปตท.เลี่ยงเมือง ลพบุรี", brand: "PTT EV Station PluZ", zone: "lopburi-mueang", latitude: 14.7646, longitude: 100.6739 },
  { id: "lb-mg", name: "MG Super Charge ลพบุรี ถ.พหลโยธิน", brand: "MG Super Charge", zone: "lopburi-mueang", latitude: 14.7699, longitude: 100.7047, maxChargeRateKw: 50, connectors: ccs, open24h: true },
  { id: "lb-byd-srisomboon", name: "ReverSharger BYD ศรีสมบูรณ์ ลพบุรี", brand: "ReverSharger", zone: "lopburi-mueang", latitude: 14.7647, longitude: 100.7155, maxChargeRateKw: 120, connectors: ccsType2 },
  { id: "lb-ea-globalhouse", name: "EA Anywhere Global House ลพบุรี", brand: "EA Anywhere", zone: "lopburi-mueang", latitude: 14.7633, longitude: 100.7164 },
  { id: "lb-ptt-pluz-west", name: "EV Station PluZ ลพบุรี (ฝั่งตะวันตก)", brand: "PTT EV Station PluZ", zone: "lopburi-mueang", latitude: 14.8103, longitude: 100.5687 },
  { id: "lb-ptt-artillery", name: "EV Station PluZ ปตท.ศูนย์การทหารปืนใหญ่", brand: "PTT EV Station PluZ", zone: "lopburi-mueang", latitude: 14.8844, longitude: 100.6317 },

  // เพชรบูรณ์: LAFIN / Livist Resort / ก่อนขึ้นเขาค้อ-ภูทับเบิก
  { id: "pb-pea-office", name: "PEA VOLTA การไฟฟ้าส่วนภูมิภาค จ.เพชรบูรณ์", brand: "PEA VOLTA", zone: "phetchabun-mueang", latitude: 16.4237, longitude: 101.1624, note: "ยังไม่ยืนยันว่ามีที่ชาร์จ เช็คในแอป PEA VOLTA ก่อน" },
  { id: "pb-elex-pcru", name: "EleX by EGAT ม.ราชภัฏเพชรบูรณ์ (PCRU)", brand: "EleX by EGAT", zone: "phetchabun-mueang", latitude: 16.4519, longitude: 101.1528, maxChargeRateKw: 100, connectors: ccs },
  { id: "pb-ptt-pcru", name: "EV Station PluZ ปตท.สวัสดิการ ม.ราชภัฏเพชรบูรณ์", brand: "PTT EV Station PluZ", zone: "phetchabun-mueang", latitude: 16.4533, longitude: 101.1535, maxChargeRateKw: 120, connectors: ccsType2 },
  { id: "pb-chargeplus-pcru", name: "ChargePlus เพชรบูรณ์ (ใกล้ ม.ราชภัฏ)", brand: "Charge+", zone: "phetchabun-mueang", latitude: 16.4542, longitude: 101.1513, open24h: true },
  { id: "pb-ptt-banphi", name: "EV Station PluZ ปตท.บ้านพี้", brand: "PTT EV Station PluZ", zone: "phetchabun-mueang", latitude: 16.3871, longitude: 101.1272 },
  { id: "pb-byd-srisomboon", name: "ReverSharger BYD ศรีสมบูรณ์ เพชรบูรณ์", brand: "ReverSharger", zone: "phetchabun-mueang", latitude: 16.384, longitude: 101.1231, maxChargeRateKw: 120, connectors: ccsType2, open24h: true },
  { id: "pb-ptt-mueang", name: "EV Station PluZ ปตท.เมืองเพชรบูรณ์", brand: "PTT EV Station PluZ", zone: "phetchabun-mueang", latitude: 16.383, longitude: 101.122 },
  { id: "pb-mg-mitsin", name: "MG Super Charge มิตรศิลป์ ถ.คชเสนีย์", brand: "MG Super Charge", zone: "phetchabun-mueang", latitude: 16.3669, longitude: 101.109, maxChargeRateKw: 120, connectors: ccs, open24h: true },
  { id: "pb-ptt-nangua", name: "EV Station PluZ ปตท.นางั่ว", brand: "PTT EV Station PluZ", zone: "phetchabun-mueang", latitude: 16.4999, longitude: 101.1569 },
  { id: "pb-chargeplus-nangua", name: "Charge+ นางั่ว", brand: "Charge+", zone: "phetchabun-mueang", latitude: 16.5318, longitude: 101.1566, open24h: true },
  { id: "pb-spark-bangchak", name: "Spark EV ปั๊มบางจาก (ทางใต้เมืองเพชรบูรณ์)", brand: "Spark EV (บางจาก)", zone: "phetchabun-mueang", latitude: 16.2619, longitude: 101.0484 },
];
