import { describe, expect, it } from "vitest";
import { batterySummaryText, estimateBatteryByLegs } from "@/lib/battery";
import { bangkok, chargingStation, huaHin, place, settings } from "../fixtures";

const km = (value: number) => ({ distanceMeters: value * 1000, duration: `${value * 60}s` });

describe("estimateBatteryByLegs", () => {
  it("estimates energy and arrival battery from distance and km/kWh", () => {
    // 100 km / 5 km/kWh = 20 kWh = 33.33% of 60 kWh
    const [leg] = estimateBatteryByLegs({ legs: [km(100)], stops: [bangkok, huaHin], settings });

    expect(leg.energyUsedKwh).toBeCloseTo(20);
    expect(leg.batteryBeforePercent).toBe(80);
    expect(leg.batteryArrivalPercent).toBeCloseTo(46.667, 2);
    expect(leg.batteryAfterChargePercent).toBeCloseTo(46.667, 2);
    expect(leg.risk).toBe("ปลอดภัย");
    expect(leg.fromName).toBe(bangkok.name);
    expect(leg.toName).toBe(huaHin.name);
  });

  it("flags legs longer than max range as not possible", () => {
    const [leg] = estimateBatteryByLegs({ legs: [km(301)], stops: [bangkok, huaHin], settings: { ...settings, batteryStartPercent: 100, batteryCapacityKwh: 250 } });
    expect(leg.risk).toBe("ไม่สามารถเดินทางช่วงนี้ได้ตามค่าที่ตั้งไว้");
  });

  it("flags negative arrival battery as not possible", () => {
    const [leg] = estimateBatteryByLegs({ legs: [km(250)], stops: [bangkok, huaHin], settings });
    expect(leg.batteryArrivalPercent).toBeLessThan(0);
    expect(leg.risk).toBe("ไม่สามารถเดินทางช่วงนี้ได้ตามค่าที่ตั้งไว้");
  });

  it("classifies arrival below reserve and within the 12% planning buffer", () => {
    // 60 kWh, 5 km/kWh -> 3 km per 1%
    const below = estimateBatteryByLegs({ legs: [km(198)], stops: [bangkok, huaHin], settings })[0]; // arrival 14%
    const buffer = estimateBatteryByLegs({ legs: [km(180)], stops: [bangkok, huaHin], settings })[0]; // arrival 20%

    expect(below.risk).toBe("ต่ำกว่าแบตเตอรี่สำรอง");
    expect(below.recommendation).toBe("ควรเพิ่มสถานีชาร์จเป็นจุดแวะก่อนเดินทางช่วงนี้");
    expect(buffer.risk).toBe("ควรวางแผนชาร์จ");
  });

  it("charges to the stop target and carries it into the next leg", () => {
    const station = chargingStation("cs", 90);
    const [first, second] = estimateBatteryByLegs({ legs: [km(180), km(30)], stops: [bangkok, station, huaHin], settings });

    expect(first.batteryArrivalPercent).toBeCloseTo(20);
    expect(first.batteryAfterChargePercent).toBe(90);
    expect(first.recommendation).toBe("ควรเผื่อเวลาชาร์จและตรวจสอบสถานะจริงกับผู้ให้บริการ");
    expect(second.batteryBeforePercent).toBe(90);
  });

  it("defaults charge target to 85% and never lowers battery at a charger", () => {
    const [defaultTarget] = estimateBatteryByLegs({ legs: [km(30)], stops: [bangkok, chargingStation("a")], settings });
    const [aboveTarget] = estimateBatteryByLegs({ legs: [km(3)], stops: [bangkok, chargingStation("b", 50)], settings });

    expect(defaultTarget.batteryAfterChargePercent).toBe(85);
    expect(aboveTarget.batteryAfterChargePercent).toBeCloseTo(79);
  });

  it("falls back to numbered names when stops are missing", () => {
    const [leg] = estimateBatteryByLegs({ legs: [km(10)], stops: [], settings });
    expect(leg.fromName).toBe("จุดที่ 1");
    expect(leg.toName).toBe("จุดที่ 2");
  });

  it("returns an empty list for no legs", () => {
    expect(estimateBatteryByLegs({ legs: [], stops: [place("x", 1, 1)], settings })).toEqual([]);
  });
});

describe("batterySummaryText", () => {
  it("describes empty, safe and risky estimates", () => {
    const safe = estimateBatteryByLegs({ legs: [km(30)], stops: [bangkok, huaHin], settings });
    const risky = estimateBatteryByLegs({ legs: [km(198)], stops: [bangkok, huaHin], settings });

    expect(batterySummaryText([])).toBe("ยังไม่มีข้อมูลเส้นทางสำหรับประเมินแบตเตอรี่");
    expect(batterySummaryText(safe)).toBe("ทุกช่วงอยู่ในระดับปลอดภัยโดยประมาณ ใช้พลังงานรวม 6 kWh");
    expect(batterySummaryText(risky)).toMatch(/^พบ 1 ช่วงที่ควรวางแผนเพิ่ม/);
  });
});
