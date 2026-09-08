import type { EVConnectorType, TourismCategory } from "@/types/trip";

export const connectorOptions: Array<{ value: EVConnectorType | "ANY"; label: string }> = [
  { value: "ANY", label: "ทุกหัวชาร์จ" },
  { value: "EV_CONNECTOR_TYPE_CCS_COMBO_2", label: "CCS Combo 2" },
  { value: "EV_CONNECTOR_TYPE_CHADEMO", label: "CHAdeMO" },
  { value: "EV_CONNECTOR_TYPE_TYPE_2", label: "Type 2" },
  { value: "EV_CONNECTOR_TYPE_TESLA", label: "Tesla" },
  { value: "EV_CONNECTOR_TYPE_NACS", label: "NACS" },
  { value: "EV_CONNECTOR_TYPE_J1772", label: "J1772" },
  { value: "EV_CONNECTOR_TYPE_OTHER", label: "อื่น ๆ" },
];

export const tourismCategories: TourismCategory[] = [
  { id: "tourism", label: "สถานที่ท่องเที่ยว", includedTypes: ["tourist_attraction"] },
  { id: "nature", label: "ธรรมชาติ", includedTypes: ["national_park", "park"] },
  { id: "viewpoint", label: "จุดชมวิว", includedTypes: ["tourist_attraction"] },
  { id: "worship", label: "วัดและศาสนสถาน", includedTypes: ["place_of_worship"] },
  { id: "museum", label: "พิพิธภัณฑ์", includedTypes: ["museum"] },
  { id: "cafe", label: "คาเฟ่", includedTypes: ["cafe"] },
  { id: "restaurant", label: "ร้านอาหาร", includedTypes: ["restaurant"] },
  { id: "hotel", label: "โรงแรม", includedTypes: ["hotel"] },
  { id: "shopping", label: "แหล่งช้อปปิ้ง", includedTypes: ["shopping_mall"] },
];

export const nearbyActivityTypes = [
  "restaurant",
  "cafe",
  "public_bathroom",
  "shopping_mall",
  "convenience_store",
  "tourist_attraction",
  "hotel",
];

export function connectorLabel(value?: string) {
  if (!value) {
    return "ไม่มีข้อมูลจากผู้ให้บริการ";
  }

  return connectorOptions.find((option) => option.value === value)?.label ?? value.replace("EV_CONNECTOR_TYPE_", "");
}
