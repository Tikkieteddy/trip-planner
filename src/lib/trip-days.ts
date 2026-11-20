import { durationToSeconds } from "@/lib/format";
import { decodePolyline, encodePolyline } from "@/lib/polyline";
import type { PlannerPlace, RouteResult } from "@/types/trip";

export const maxTripDays = 14;
/** Google Routes accepts at most 10 intermediate stops per request (one request per day). */
export const maxStopsPerDay = 10;

/**
 * Split an ordered stop list (start, stops..., end) into days. A day ends at
 * every intermediate stop marked `overnight`, and the next day starts there.
 * Each day keeps its own start and end, so neighbouring days share one stop.
 */
export function splitStopsIntoDays<T extends Pick<PlannerPlace, "overnight">>(stops: T[]): T[][] {
  if (stops.length < 2) return stops.length ? [stops] : [];

  const days: T[][] = [];
  let current: T[] = [stops[0]];

  for (let index = 1; index < stops.length; index += 1) {
    current.push(stops[index]);
    const isLast = index === stops.length - 1;
    if (!isLast && stops[index].overnight) {
      days.push(current);
      current = [stops[index]];
    }
  }

  days.push(current);
  return days;
}

/** Day number (0-based) of each waypoint, where a waypoint marked overnight is the last stop of its day. */
export function waypointDayIndexes(waypoints: Pick<PlannerPlace, "overnight">[]) {
  let day = 0;
  return waypoints.map((waypoint) => {
    const current = day;
    if (waypoint.overnight) day += 1;
    return current;
  });
}

/** Add whole days to a YYYY-MM-DD date without time-zone drift. */
export function addDaysToIsoDate(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Join the routes of consecutive days into one trip-level route. */
export function combineDayRoutes(routes: RouteResult[]): RouteResult | null {
  if (routes.length === 0) return null;
  if (routes.length === 1) return routes[0];

  const points = routes.flatMap((route, index) => {
    const decoded = decodePolyline(route.encodedPolyline);
    // Each day starts where the previous one ended; drop the repeated point.
    return index === 0 ? decoded : decoded.slice(1);
  });

  return {
    distanceMeters: routes.reduce((sum, route) => sum + route.distanceMeters, 0),
    duration: `${routes.reduce((sum, route) => sum + durationToSeconds(route.duration), 0)}s`,
    encodedPolyline: encodePolyline(points),
    legs: routes.flatMap((route) => route.legs),
    optimizedWaypointOrder: [],
    warnings: [...new Set(routes.flatMap((route) => route.warnings))],
  };
}
