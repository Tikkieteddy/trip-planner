import { describe, expect, it } from "vitest";
import { decodePolyline, encodePolyline } from "@/lib/polyline";
import { addDaysToIsoDate, combineDayRoutes, splitStopsIntoDays, waypointDayIndexes } from "@/lib/trip-days";
import type { RouteResult } from "@/types/trip";

type Stop = { name: string; overnight?: boolean };
const names = (days: Stop[][]) => days.map((day) => day.map((stop) => stop.name));

describe("splitStopsIntoDays", () => {
  it("keeps a trip without overnight stops as one day", () => {
    const stops: Stop[] = [{ name: "A" }, { name: "B" }, { name: "C" }];
    expect(names(splitStopsIntoDays(stops))).toEqual([["A", "B", "C"]]);
  });

  it("ends a day at each overnight stop and starts the next day there", () => {
    const stops: Stop[] = [{ name: "A" }, { name: "B" }, { name: "Hotel", overnight: true }, { name: "C" }, { name: "Hotel2", overnight: true }, { name: "End" }];
    expect(names(splitStopsIntoDays(stops))).toEqual([
      ["A", "B", "Hotel"],
      ["Hotel", "C", "Hotel2"],
      ["Hotel2", "End"],
    ]);
  });

  it("ignores overnight flags on the first and last stop", () => {
    const stops: Stop[] = [{ name: "A", overnight: true }, { name: "B" }, { name: "C", overnight: true }];
    expect(names(splitStopsIntoDays(stops))).toEqual([["A", "B", "C"]]);
  });

  it("handles empty and single-stop input", () => {
    expect(splitStopsIntoDays([])).toEqual([]);
    expect(names(splitStopsIntoDays<Stop>([{ name: "A" }]))).toEqual([["A"]]);
  });
});

describe("waypointDayIndexes", () => {
  it("puts the overnight stop at the end of its own day", () => {
    expect(waypointDayIndexes([{}, { overnight: true }, {}, { overnight: true }, {}])).toEqual([0, 0, 1, 1, 2]);
  });
});

describe("addDaysToIsoDate", () => {
  it("adds days across month and year ends", () => {
    expect(addDaysToIsoDate("2026-11-20", 0)).toBe("2026-11-20");
    expect(addDaysToIsoDate("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysToIsoDate("2026-12-31", 2)).toBe("2027-01-02");
  });

  it("returns the input when it is not a date", () => {
    expect(addDaysToIsoDate("", 1)).toBe("");
  });
});

describe("combineDayRoutes", () => {
  const dayOne: RouteResult = {
    distanceMeters: 1000,
    duration: "600s",
    encodedPolyline: encodePolyline([
      { latitude: 13.7, longitude: 100.5 },
      { latitude: 13.8, longitude: 100.6 },
    ]),
    legs: [{ distanceMeters: 1000, duration: "600s" }],
    optimizedWaypointOrder: [0],
    warnings: ["toll"],
  };
  const dayTwo: RouteResult = {
    distanceMeters: 2500,
    duration: "900s",
    encodedPolyline: encodePolyline([
      { latitude: 13.8, longitude: 100.6 },
      { latitude: 14.0, longitude: 100.7 },
    ]),
    legs: [
      { distanceMeters: 1500, duration: "500s" },
      { distanceMeters: 1000, duration: "400s" },
    ],
    optimizedWaypointOrder: [],
    warnings: ["toll", "ferry"],
  };

  it("sums distance and time and joins legs and the polyline", () => {
    const combined = combineDayRoutes([dayOne, dayTwo]);

    expect(combined?.distanceMeters).toBe(3500);
    expect(combined?.duration).toBe("1500s");
    expect(combined?.legs).toHaveLength(3);
    expect(combined?.warnings).toEqual(["toll", "ferry"]);
    expect(decodePolyline(combined?.encodedPolyline ?? "")).toEqual([
      { latitude: 13.7, longitude: 100.5 },
      { latitude: 13.8, longitude: 100.6 },
      { latitude: 14.0, longitude: 100.7 },
    ]);
  });

  it("returns a single day unchanged and null for no days", () => {
    expect(combineDayRoutes([dayOne])).toBe(dayOne);
    expect(combineDayRoutes([])).toBeNull();
  });
});
