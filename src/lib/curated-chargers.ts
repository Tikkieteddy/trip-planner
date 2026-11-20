import { curatedChargers, curatedChargersCheckedAt, type CuratedCharger } from "@/data/curated-chargers";
import type { EVConnectorType, LatLng, PlannerPlace } from "@/types/trip";

export type CuratedChargerFilters = {
  connectorType?: EVConnectorType | "ANY";
  minChargerKw?: number;
  openNowOnly?: boolean;
  minRating?: number;
};

export type FindCuratedChargersOptions = CuratedChargerFilters & {
  /** Points along the route (decoded polyline). */
  path?: LatLng[];
  /** Trip stops: origin, waypoints, destination. */
  stops?: LatLng[];
  /** Include stations within this many km of the route line. */
  routeCorridorKm?: number;
  /** Include stations within this many km of any stop. */
  stopRadiusKm?: number;
  /** Data to search; defaults to the bundled list. */
  chargers?: CuratedCharger[];
};

const earthRadiusKm = 6371;

/** Straight-line (great-circle) distance in km. */
export function haversineKm(a: LatLng, b: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Approximate distance in km from a point to a polyline (checks each segment). */
export function distanceToPathKm(point: LatLng, path: LatLng[]) {
  if (path.length === 0) return Number.POSITIVE_INFINITY;
  if (path.length === 1) return haversineKm(point, path[0]);

  // Project onto each segment in a local flat plane; fine for the short segments of a route.
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((point.latitude * Math.PI) / 180);
  let best = Number.POSITIVE_INFINITY;

  for (let index = 0; index < path.length - 1; index += 1) {
    const ax = (path[index].longitude - point.longitude) * kmPerDegLng;
    const ay = (path[index].latitude - point.latitude) * kmPerDegLat;
    const bx = (path[index + 1].longitude - point.longitude) * kmPerDegLng;
    const by = (path[index + 1].latitude - point.latitude) * kmPerDegLat;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
    const distance = Math.hypot(ax + t * dx, ay + t * dy);

    if (distance < best) best = distance;
  }

  return best;
}

function passesFilters(charger: CuratedCharger, filters: CuratedChargerFilters) {
  // Curated data has no ratings or live opening hours, so strict filters keep it out
  // unless the station is known to meet them.
  if ((filters.minRating ?? 0) > 0) return false;
  if (filters.openNowOnly && !charger.open24h) return false;
  if ((filters.minChargerKw ?? 0) > 0 && (charger.maxChargeRateKw ?? 0) < (filters.minChargerKw ?? 0)) return false;
  if (filters.connectorType && filters.connectorType !== "ANY" && !charger.connectors?.includes(filters.connectorType)) return false;

  return true;
}

export function curatedChargerToPlace(charger: CuratedCharger): PlannerPlace {
  const { latitude, longitude } = charger;
  const noteParts = [`ข้อมูลสำรวจเอง (${curatedChargersCheckedAt}) · ${charger.brand}`];

  if (charger.open24h) noteParts.push("เปิด 24 ชม.");
  if (charger.note) noteParts.push(charger.note);

  return {
    id: `curated:${charger.id}`,
    name: charger.name,
    location: { latitude, longitude },
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    primaryType: "electric_vehicle_charging_station",
    types: ["electric_vehicle_charging_station"],
    evChargeOptions: charger.maxChargeRateKw
      ? {
          connectorCount: charger.connectors?.length,
          connectorAggregation: (charger.connectors ?? ["EV_CONNECTOR_TYPE_OTHER"]).map((type) => ({
            type,
            maxChargeRateKw: charger.maxChargeRateKw,
          })),
        }
      : undefined,
    source: "curated",
    note: noteParts.join(" · "),
  };
}

/** Bundled chargers near the route line or near any trip stop, closest to the route first. */
export function findCuratedChargers(options: FindCuratedChargersOptions): PlannerPlace[] {
  const { path = [], stops = [], routeCorridorKm = 3, stopRadiusKm = 20, chargers = curatedChargers } = options;

  if (path.length === 0 && stops.length === 0) return [];

  return chargers
    .filter((charger) => passesFilters(charger, options))
    .map((charger) => {
      const point = { latitude: charger.latitude, longitude: charger.longitude };
      const routeKm = distanceToPathKm(point, path);
      const stopKm = stops.reduce((nearest, stop) => Math.min(nearest, haversineKm(point, stop)), Number.POSITIVE_INFINITY);

      return { charger, routeKm, include: routeKm <= routeCorridorKm || stopKm <= stopRadiusKm };
    })
    .filter((item) => item.include)
    .sort((first, second) => first.routeKm - second.routeKm)
    .map((item) => curatedChargerToPlace(item.charger));
}

/**
 * Add curated stations to Google results. A curated station is dropped when a Google
 * result sits within `duplicateWithinKm`, since that is almost always the same charger.
 */
export function mergeCuratedChargers(googlePlaces: PlannerPlace[], curated: PlannerPlace[], duplicateWithinKm = 0.15) {
  const extra = curated.filter(
    (place) => !googlePlaces.some((existing) => haversineKm(existing.location, place.location) <= duplicateWithinKm),
  );

  return [...googlePlaces, ...extra];
}
