import type { BatteryLegEstimate, BatteryRisk, PlannerPlace, RouteLeg, TripSettings } from "@/types/trip";
import { formatDuration, formatKwh } from "@/lib/format";

function getRisk({
  arrival,
  reserve,
  distanceKm,
  maxRangeKm,
}: {
  arrival: number;
  reserve: number;
  distanceKm: number;
  maxRangeKm: number;
}): BatteryRisk {
  if (distanceKm > maxRangeKm || arrival < 0) {
    return "ไม่สามารถเดินทางช่วงนี้ได้ตามค่าที่ตั้งไว้";
  }

  if (arrival < reserve) {
    return "ต่ำกว่าแบตเตอรี่สำรอง";
  }

  if (arrival < reserve + 12) {
    return "ควรวางแผนชาร์จ";
  }

  return "ปลอดภัย";
}

function getRecommendation(risk: BatteryRisk, toPlace: PlannerPlace) {
  if (risk === "ปลอดภัย") {
    return "เดินทางช่วงนี้ได้ตามค่าที่ตั้งไว้";
  }

  if (toPlace.evChargeOptions || toPlace.types?.includes("electric_vehicle_charging_station")) {
    return "ควรเผื่อเวลาชาร์จและตรวจสอบสถานะจริงกับผู้ให้บริการ";
  }

  return "ควรเพิ่มสถานีชาร์จเป็นจุดแวะก่อนเดินทางช่วงนี้";
}

export function estimateBatteryByLegs({
  legs,
  stops,
  settings,
}: {
  legs: RouteLeg[];
  stops: PlannerPlace[];
  settings: TripSettings;
}): BatteryLegEstimate[] {
  let currentBattery = settings.batteryStartPercent;

  return legs.map((leg, index) => {
    const fromPlace = stops[index];
    const toPlace = stops[index + 1];
    const distanceKm = leg.distanceMeters / 1000;
    const energyUsedKwh = distanceKm / settings.efficiencyKmPerKwh;
    const batteryUsedPercent = (energyUsedKwh / settings.batteryCapacityKwh) * 100;
    const arrival = currentBattery - batteryUsedPercent;
    const isChargingStop = Boolean(toPlace?.evChargeOptions || toPlace?.types?.includes("electric_vehicle_charging_station"));
    const chargeTarget = toPlace?.chargeTargetPercent ?? 85;
    const afterCharge = isChargingStop ? Math.max(arrival, Math.min(100, chargeTarget)) : arrival;
    const risk = getRisk({
      arrival,
      reserve: settings.reservePercent,
      distanceKm,
      maxRangeKm: settings.maxRangeKm,
    });

    const estimate: BatteryLegEstimate = {
      index,
      fromName: fromPlace?.name ?? `จุดที่ ${index + 1}`,
      toName: toPlace?.name ?? `จุดที่ ${index + 2}`,
      distanceKm,
      durationText: formatDuration(leg.duration),
      energyUsedKwh,
      batteryBeforePercent: currentBattery,
      batteryArrivalPercent: arrival,
      batteryAfterChargePercent: afterCharge,
      risk,
      recommendation: getRecommendation(risk, toPlace),
    };

    currentBattery = afterCharge;
    return estimate;
  });
}

export function batterySummaryText(estimates: BatteryLegEstimate[]) {
  const risky = estimates.filter((estimate) => estimate.risk !== "ปลอดภัย");
  const energy = estimates.reduce((total, estimate) => total + estimate.energyUsedKwh, 0);

  if (estimates.length === 0) {
    return "ยังไม่มีข้อมูลเส้นทางสำหรับประเมินแบตเตอรี่";
  }

  if (risky.length === 0) {
    return `ทุกช่วงอยู่ในระดับปลอดภัยโดยประมาณ ใช้พลังงานรวม ${formatKwh(energy)}`;
  }

  return `พบ ${risky.length} ช่วงที่ควรวางแผนเพิ่ม ใช้พลังงานรวม ${formatKwh(energy)}`;
}
