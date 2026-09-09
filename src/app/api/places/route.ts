import { googleJson, GoogleApiError } from "@/lib/google";
import { normalizePlacesSearchResponse, normalizePredictionResponse, type GooglePlacesSearchResponse } from "@/lib/google-place";
import { placesRequestSchema } from "@/lib/schemas";

type AutocompleteGoogleResponse = Parameters<typeof normalizePredictionResponse>[0];

const placesBaseUrl = "https://places.googleapis.com/v1";
const placeFields =
  "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.primaryType,places.types,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.evChargeOptions";

function errorResponse(error: unknown) {
  if (error instanceof GoogleApiError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }

  return Response.json({ error: "ไม่สามารถประมวลผลคำขอได้" }, { status: 500 });
}

function schemaErrorMessage(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const issue = error.issues[0];
  const field = issue?.path.length ? issue.path.join(".") : "ข้อมูลค้นหา";

  return issue ? `ข้อมูลค้นหาไม่ถูกต้อง: ${field} ${issue.message}` : "ข้อมูลค้นหาไม่ถูกต้อง";
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = placesRequestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: schemaErrorMessage(parsed.error) }, { status: 400 });
    }

    if (parsed.data.mode === "autocomplete") {
      const response = await googleJson<AutocompleteGoogleResponse>({
        url: `${placesBaseUrl}/places:autocomplete`,
        body: {
          input: parsed.data.input,
          languageCode: "th",
          regionCode: "TH",
          sessionToken: parsed.data.sessionToken,
          ...(parsed.data.center
            ? {
                locationBias: {
                  circle: {
                    center: parsed.data.center,
                    radius: 50000,
                  },
                },
              }
            : {}),
        },
        fieldMask:
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text,suggestions.placePrediction.types,suggestions.placePrediction.distanceMeters",
      });

      return Response.json({ predictions: normalizePredictionResponse(response) });
    }

    if (parsed.data.mode === "text-search") {
      const response = await googleJson<GooglePlacesSearchResponse>({
        url: `${placesBaseUrl}/places:searchText`,
        body: {
          textQuery: parsed.data.input,
          languageCode: "th",
          regionCode: "TH",
          maxResultCount: parsed.data.maxResultCount,
          ...(parsed.data.center
            ? {
                locationBias: {
                  circle: {
                    center: parsed.data.center,
                    radius: 50000,
                  },
                },
              }
            : {}),
        },
        fieldMask: placeFields,
      });

      return Response.json({ places: normalizePlacesSearchResponse(response) });
    }

    if (parsed.data.mode === "route-chargers") {
      const response = await googleJson<GooglePlacesSearchResponse>({
        url: `${placesBaseUrl}/places:searchText`,
        body: {
          textQuery: "EV charging station สถานีชาร์จรถไฟฟ้า",
          languageCode: "th",
          regionCode: "TH",
          includedType: "electric_vehicle_charging_station",
          strictTypeFiltering: true,
          maxResultCount: parsed.data.maxResultCount,
          minRating: parsed.data.minRating || undefined,
          openNow: parsed.data.openNowOnly || undefined,
          searchAlongRouteParameters: {
            polyline: {
              encodedPolyline: parsed.data.encodedPolyline,
            },
          },
          evOptions: {
            minimumChargingRateKw: parsed.data.minChargerKw || undefined,
            connectorTypes:
              parsed.data.connectorType && parsed.data.connectorType !== "ANY" ? [parsed.data.connectorType] : undefined,
          },
        },
        fieldMask: placeFields,
      });

      return Response.json({ places: normalizePlacesSearchResponse(response) });
    }

    const response = await googleJson<GooglePlacesSearchResponse>({
      url: `${placesBaseUrl}/places:searchNearby`,
      body: {
        includedTypes: parsed.data.includedTypes,
        maxResultCount: parsed.data.maxResultCount,
        rankPreference: parsed.data.rankPreference,
        languageCode: "th",
        regionCode: "TH",
        locationRestriction: {
          circle: {
            center: parsed.data.center,
            radius: parsed.data.radiusKm * 1000,
          },
        },
      },
      fieldMask: placeFields,
    });

    return Response.json({ places: normalizePlacesSearchResponse(response) });
  } catch (error) {
    return errorResponse(error);
  }
}
