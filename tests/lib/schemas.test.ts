import { describe, expect, it } from "vitest";
import { placesRequestSchema, routeRequestSchema, savedRouteLibrarySchema, tripSettingsSchema } from "@/lib/schemas";
import { bangkok, huaHin, place, savedRoute, settings } from "../fixtures";

describe("routeRequestSchema", () => {
  it("applies defaults for optional route options", () => {
    const parsed = routeRequestSchema.parse({ origin: bangkok, destination: huaHin });
    expect(parsed).toMatchObject({ waypoints: [], avoidTolls: false, avoidHighways: false, avoidFerries: false, optimizeWaypointOrder: false });
  });

  it("rejects more than 10 waypoints", () => {
    const waypoints = Array.from({ length: 11 }, (_, index) => place(`w${index}`, 13, 100));
    expect(routeRequestSchema.safeParse({ origin: bangkok, destination: huaHin, waypoints }).success).toBe(false);
  });

  it("rejects out-of-range coordinates and non-ISO departure time", () => {
    expect(routeRequestSchema.safeParse({ origin: place("bad", 91, 100), destination: huaHin }).success).toBe(false);
    expect(routeRequestSchema.safeParse({ origin: bangkok, destination: huaHin, departureTime: "tomorrow" }).success).toBe(false);
  });
});

describe("placesRequestSchema", () => {
  it("routes requests by mode and rejects unknown modes", () => {
    expect(placesRequestSchema.safeParse({ mode: "autocomplete", input: "หัวหิน" }).success).toBe(true);
    expect(placesRequestSchema.safeParse({ mode: "unknown", input: "x" }).success).toBe(false);
    expect(placesRequestSchema.safeParse({}).success).toBe(false);
  });

  it("limits charger search polylines to 20,000 characters", () => {
    const ok = placesRequestSchema.safeParse({ mode: "route-chargers", encodedPolyline: "a".repeat(20000) });
    const tooLong = placesRequestSchema.safeParse({ mode: "route-chargers", encodedPolyline: "a".repeat(20001) });

    expect(ok.success && ok.data.mode === "route-chargers" && ok.data.provider).toBe("all");
    expect(tooLong.success).toBe(false);
  });

  it("requires at least one nearby type and bounds the radius", () => {
    const base = { mode: "nearby", center: bangkok.location, radiusKm: 5, includedTypes: ["cafe"] };
    expect(placesRequestSchema.safeParse(base).success).toBe(true);
    expect(placesRequestSchema.safeParse({ ...base, includedTypes: [] }).success).toBe(false);
    expect(placesRequestSchema.safeParse({ ...base, radiusKm: 51 }).success).toBe(false);
  });
});

describe("trip settings and saved routes", () => {
  it("accepts the default vehicle profile and rejects impossible values", () => {
    expect(tripSettingsSchema.safeParse(settings).success).toBe(true);
    expect(tripSettingsSchema.safeParse({ ...settings, batteryStartPercent: 101 }).success).toBe(false);
    expect(tripSettingsSchema.safeParse({ ...settings, efficiencyKmPerKwh: 0 }).success).toBe(false);
  });

  it("caps the route library at 25 routes", () => {
    const routes = Array.from({ length: 25 }, (_, index) => savedRoute(String(index)));
    expect(savedRouteLibrarySchema.safeParse(routes).success).toBe(true);
    expect(savedRouteLibrarySchema.safeParse([...routes, savedRoute("extra")]).success).toBe(false);
  });

  it("rejects saved routes with blank names", () => {
    expect(savedRouteLibrarySchema.safeParse([{ ...savedRoute("a"), name: "   " }]).success).toBe(false);
  });
});
