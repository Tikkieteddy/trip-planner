import { describe, expect, it } from "vitest";
import { curatedChargers, type CuratedCharger } from "@/data/curated-chargers";
import {
  curatedChargerToPlace,
  distanceToPathKm,
  findCuratedChargers,
  haversineKm,
  mergeCuratedChargers,
} from "@/lib/curated-chargers";
import { savedTripSchema } from "@/lib/schemas";
import type { PlannerPlace } from "@/types/trip";

const sample: CuratedCharger[] = [
  { id: "near-route", name: "EV Station PluZ ทดสอบ", brand: "PTT EV Station PluZ", zone: "salaya", latitude: 14.0, longitude: 100.51, maxChargeRateKw: 120, connectors: ["EV_CONNECTOR_TYPE_CCS_COMBO_2"], open24h: true },
  { id: "near-stop", name: "PEA VOLTA ทดสอบ", brand: "PEA VOLTA", zone: "salaya", latitude: 15.1, longitude: 100.6 },
  { id: "far", name: "ไกลเกิน", brand: "X", zone: "salaya", latitude: 17.5, longitude: 99.0 },
];
const path = [
  { latitude: 13.8, longitude: 100.5 },
  { latitude: 14.5, longitude: 100.5 },
];
const stops = [path[0], { latitude: 15.0, longitude: 100.6 }];

describe("bundled curated chargers", () => {
  it("has unique ids and coordinates inside Thailand", () => {
    const ids = curatedChargers.map((charger) => charger.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const charger of curatedChargers) {
      expect(charger.latitude).toBeGreaterThan(5);
      expect(charger.latitude).toBeLessThan(21);
      expect(charger.longitude).toBeGreaterThan(97);
      expect(charger.longitude).toBeLessThan(106);
      expect(charger.name.length).toBeGreaterThan(0);
      expect(charger.brand.length).toBeGreaterThan(0);
    }
  });

  it("converts to a planner place that saved trips accept", () => {
    const place = curatedChargerToPlace(curatedChargers[0]);
    expect(place.source).toBe("curated");
    expect(place.id).toBe(`curated:${curatedChargers[0].id}`);
    const trip = {
      origin: null,
      destination: null,
      waypoints: [place],
    };
    const parsed = savedTripSchema.shape.waypoints.safeParse(trip.waypoints);
    expect(parsed.success).toBe(true);
  });
});

describe("distance helpers", () => {
  it("measures about 111 km per degree of latitude", () => {
    expect(haversineKm({ latitude: 13, longitude: 100 }, { latitude: 14, longitude: 100 })).toBeCloseTo(111.2, 0);
  });

  it("measures distance to the nearest route segment", () => {
    expect(distanceToPathKm({ latitude: 14.0, longitude: 100.51 }, path)).toBeCloseTo(1.08, 1);
    expect(distanceToPathKm({ latitude: 14.0, longitude: 100.5 }, [])).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("findCuratedChargers", () => {
  it("keeps stations near the route or within the stop radius, closest to the route first", () => {
    const ids = findCuratedChargers({ path, stops, chargers: sample }).map((place) => place.id);
    expect(ids).toEqual(["curated:near-route", "curated:near-stop"]);
  });

  it("returns nothing without a route or stops", () => {
    expect(findCuratedChargers({ chargers: sample })).toEqual([]);
  });

  it("applies charger filters conservatively", () => {
    expect(findCuratedChargers({ path, stops, chargers: sample, minChargerKw: 100 }).map((place) => place.id)).toEqual(["curated:near-route"]);
    expect(findCuratedChargers({ path, stops, chargers: sample, openNowOnly: true }).map((place) => place.id)).toEqual(["curated:near-route"]);
    expect(findCuratedChargers({ path, stops, chargers: sample, connectorType: "EV_CONNECTOR_TYPE_CHADEMO" })).toEqual([]);
    expect(findCuratedChargers({ path, stops, chargers: sample, minRating: 4 })).toEqual([]);
  });
});

describe("mergeCuratedChargers", () => {
  it("drops curated stations that duplicate a nearby Google result", () => {
    const google: PlannerPlace = {
      id: "g1",
      name: "Google station",
      location: { latitude: 14.0005, longitude: 100.5105 },
      source: "google",
    };
    const curated = findCuratedChargers({ path, stops, chargers: sample });
    const merged = mergeCuratedChargers([google], curated);
    expect(merged.map((place) => place.id)).toEqual(["g1", "curated:near-stop"]);
  });
});
