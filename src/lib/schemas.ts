import { z } from "zod";

const latLngSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const plannerPlaceSchema = z.object({
  id: z.string().min(1).max(256),
  placeId: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(240),
  address: z.string().max(800).optional(),
  location: latLngSchema,
  googleMapsUri: z.string().url().optional(),
  primaryType: z.string().max(120).optional(),
  types: z.array(z.string().max(120)).max(30).optional(),
  rating: z.number().min(0).max(5).optional(),
  userRatingCount: z.number().int().min(0).optional(),
  openNow: z.boolean().nullable().optional(),
  evChargeOptions: z
    .object({
      connectorCount: z.number().int().min(0).optional(),
      connectorAggregation: z
        .array(
          z.object({
            type: z.string().optional(),
            maxChargeRateKw: z.number().min(0).optional(),
            count: z.number().int().min(0).optional(),
            availabilityLastUpdateTime: z.string().optional(),
            availableCount: z.number().int().min(0).optional(),
            outOfServiceCount: z.number().int().min(0).optional(),
          }),
        )
        .max(30)
        .optional(),
    })
    .optional(),
  source: z.enum(["google", "map_click"]),
  note: z.string().max(600).optional(),
  stopMinutes: z.number().int().min(0).max(600).optional(),
  chargeTargetPercent: z.number().min(0).max(100).optional(),
});

export const autocompleteRequestSchema = z.object({
  mode: z.literal("autocomplete"),
  input: z.string().trim().min(2).max(120),
  sessionToken: z.string().min(8).max(128).optional(),
  center: latLngSchema.optional(),
});

export const textSearchRequestSchema = z.object({
  mode: z.literal("text-search"),
  input: z.string().trim().min(2).max(160),
  center: latLngSchema.optional(),
  maxResultCount: z.number().int().min(1).max(10).default(5),
});

export const routeChargersRequestSchema = z.object({
  mode: z.literal("route-chargers"),
  encodedPolyline: z.string().min(12).max(20000),
  connectorType: z.string().max(80).optional(),
  minChargerKw: z.number().min(0).max(500).optional(),
  openNowOnly: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxResultCount: z.number().int().min(1).max(20).default(8),
});

export const nearbyRequestSchema = z.object({
  mode: z.literal("nearby"),
  center: latLngSchema,
  radiusKm: z.number().min(1).max(50),
  includedTypes: z.array(z.string().min(2).max(80)).min(1).max(8),
  maxResultCount: z.number().int().min(1).max(20).default(12),
  rankPreference: z.enum(["POPULARITY", "DISTANCE"]).default("POPULARITY"),
});

export const placesRequestSchema = z.discriminatedUnion("mode", [
  autocompleteRequestSchema,
  textSearchRequestSchema,
  routeChargersRequestSchema,
  nearbyRequestSchema,
]);

export const placeDetailsRequestSchema = z.object({
  placeId: z.string().min(2).max(256),
});

export const routeRequestSchema = z.object({
  origin: plannerPlaceSchema,
  destination: plannerPlaceSchema,
  waypoints: z.array(plannerPlaceSchema).max(10).default([]),
  departureTime: z.string().datetime().optional(),
  avoidTolls: z.boolean().default(false),
  avoidHighways: z.boolean().default(false),
  avoidFerries: z.boolean().default(false),
  optimizeWaypointOrder: z.boolean().default(false),
});

export const tripSettingsSchema = z.object({
  profileName: z.string().min(1).max(120),
  travelDate: z.string().min(8).max(20),
  departureTime: z.string().min(4).max(8),
  tripType: z.enum(["one-way", "round-trip"]),
  days: z.number().int().min(1).max(7),
  batteryStartPercent: z.number().min(1).max(100),
  reservePercent: z.number().min(0).max(80),
  batteryCapacityKwh: z.number().min(10).max(250),
  efficiencyKmPerKwh: z.number().min(1).max(15),
  maxRangeKm: z.number().min(50).max(1200),
  minChargerKw: z.number().min(0).max(500),
  connectorType: z.string().min(2).max(80),
  maxStops: z.number().int().min(0).max(10),
  tourismRadiusKm: z.number().min(1).max(50),
  avoidTolls: z.boolean(),
  avoidHighways: z.boolean(),
  avoidFerries: z.boolean(),
  optimizeWaypointOrder: z.boolean(),
  openNowOnly: z.boolean(),
  minRating: z.number().min(0).max(5),
});

export const savedTripSchema = z.object({
  version: z.literal(1),
  savedAt: z.string().min(1),
  settings: tripSettingsSchema,
  origin: plannerPlaceSchema.nullable(),
  destination: plannerPlaceSchema.nullable(),
  waypoints: z.array(plannerPlaceSchema).max(10),
  tourismCenter: plannerPlaceSchema.nullable(),
});
