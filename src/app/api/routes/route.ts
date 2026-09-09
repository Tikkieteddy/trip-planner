import { GoogleApiError, googleJson } from "@/lib/google";
import { routeRequestSchema } from "@/lib/schemas";

type GoogleRouteResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    staticDuration?: string;
    polyline?: {
      encodedPolyline?: string;
    };
    legs?: Array<{
      distanceMeters?: number;
      duration?: string;
      staticDuration?: string;
    }>;
    optimizedIntermediateWaypointIndex?: number[];
    warnings?: string[];
  }>;
};

function errorResponse(error: unknown) {
  if (error instanceof GoogleApiError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }

  return Response.json({ error: "ไม่สามารถคำนวณเส้นทางได้" }, { status: 500 });
}

function schemaErrorMessage(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const issue = error.issues[0];
  const field = issue?.path.length ? issue.path.join(".") : "ข้อมูลเส้นทาง";

  return issue ? `ข้อมูลเส้นทางไม่ถูกต้อง: ${field} ${issue.message}` : "ข้อมูลเส้นทางไม่ถูกต้อง";
}

function isSamePlace(originPlaceId?: string, destinationPlaceId?: string) {
  return Boolean(originPlaceId && destinationPlaceId && originPlaceId === destinationPlaceId);
}

function isSameLocation(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) {
  const latDelta = Math.abs(origin.latitude - destination.latitude);
  const lngDelta = Math.abs(origin.longitude - destination.longitude);
  return latDelta < 0.00005 && lngDelta < 0.00005;
}

function waypointFromLatLng(location: { latitude: number; longitude: number }) {
  return {
    location: {
      latLng: location,
    },
  };
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = routeRequestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: schemaErrorMessage(parsed.error) }, { status: 400 });
    }

    const { origin, destination, waypoints } = parsed.data;

    if (waypoints.length === 0 && (isSamePlace(origin.placeId, destination.placeId) || isSameLocation(origin.location, destination.location))) {
      return Response.json({ error: "ต้นทางและปลายทางต้องไม่เป็นจุดเดียวกัน" }, { status: 400 });
    }

    const response = await googleJson<GoogleRouteResponse>({
      url: "https://routes.googleapis.com/directions/v2:computeRoutes",
      body: {
        origin: waypointFromLatLng(origin.location),
        destination: waypointFromLatLng(destination.location),
        intermediates: waypoints.map((waypoint) => waypointFromLatLng(waypoint.location)),
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        optimizeWaypointOrder: parsed.data.optimizeWaypointOrder && waypoints.length > 1,
        routeModifiers: {
          avoidTolls: parsed.data.avoidTolls,
          avoidHighways: parsed.data.avoidHighways,
          avoidFerries: parsed.data.avoidFerries,
        },
        polylineEncoding: "ENCODED_POLYLINE",
        polylineQuality: "HIGH_QUALITY",
        languageCode: "th",
        units: "METRIC",
        departureTime: parsed.data.departureTime,
      },
      fieldMask:
        "routes.distanceMeters,routes.duration,routes.staticDuration,routes.polyline.encodedPolyline,routes.legs.distanceMeters,routes.legs.duration,routes.legs.staticDuration,routes.optimizedIntermediateWaypointIndex,routes.warnings",
    });

    const route = response.routes?.[0];

    if (!route?.distanceMeters || !route.duration || !route.polyline?.encodedPolyline) {
      return Response.json({ error: "Google Routes API ไม่พบเส้นทางที่ใช้งานได้" }, { status: 502 });
    }

    return Response.json({
      route: {
        distanceMeters: route.distanceMeters,
        duration: route.duration,
        encodedPolyline: route.polyline.encodedPolyline,
        legs:
          route.legs?.map((leg) => ({
            distanceMeters: leg.distanceMeters ?? 0,
            duration: leg.duration ?? leg.staticDuration ?? "0s",
            staticDuration: leg.staticDuration,
          })) ?? [],
        optimizedWaypointOrder: route.optimizedIntermediateWaypointIndex ?? [],
        warnings: route.warnings ?? [],
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
