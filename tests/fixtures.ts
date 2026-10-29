import type { PlannerPlace, SavedRoute, TripSettings } from "@/types/trip";

export function place(id: string, latitude: number, longitude: number, extra: Partial<PlannerPlace> = {}): PlannerPlace {
  return { id, name: `Place ${id}`, location: { latitude, longitude }, source: "google", ...extra };
}

export const bangkok = place("bkk", 13.7563, 100.5018, { placeId: "bkk-place" });
export const huaHin = place("hh", 12.5684, 99.9577, { placeId: "hh-place" });

export function chargingStation(id: string, chargeTargetPercent?: number): PlannerPlace {
  return place(id, 13.1, 100.1, { types: ["electric_vehicle_charging_station"], chargeTargetPercent });
}

export const settings: TripSettings = {
  profileName: "Test EV",
  travelDate: "2026-11-01",
  departureTime: "08:00",
  tripType: "one-way",
  days: 1,
  batteryStartPercent: 80,
  reservePercent: 15,
  batteryCapacityKwh: 60,
  efficiencyKmPerKwh: 5,
  maxRangeKm: 300,
  minChargerKw: 0,
  connectorType: "ANY",
  maxStops: 3,
  tourismRadiusKm: 5,
  avoidTolls: false,
  avoidHighways: false,
  avoidFerries: false,
  optimizeWaypointOrder: false,
  openNowOnly: false,
  minRating: 0,
  includeEvStationPluz: true,
};

export function savedRoute(id: string): SavedRoute {
  return {
    id: `route-${id}`.padEnd(8, "0"),
    name: `Route ${id}`,
    version: 2,
    savedAt: "2026-10-29T00:00:00.000Z",
    settings,
    origin: bangkok,
    destination: huaHin,
    waypoints: [],
    tourismCenter: null,
  };
}

export function jsonRequest(url: string, body: unknown, method = "POST") {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
