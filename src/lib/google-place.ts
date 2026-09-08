import type { EVChargeOptions, LatLng, PlacePrediction, PlannerPlace } from "@/types/trip";

type GoogleLocalizedText = {
  text?: string;
  languageCode?: string;
};

type GooglePlace = {
  id?: string;
  name?: string;
  displayName?: GoogleLocalizedText;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: LatLng;
  googleMapsUri?: string;
  googleMapsLinks?: {
    directionsUri?: string;
    placeUri?: string;
  };
  primaryType?: string;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  evChargeOptions?: EVChargeOptions;
};

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: GoogleLocalizedText;
      structuredFormat?: {
        mainText?: GoogleLocalizedText;
        secondaryText?: GoogleLocalizedText;
      };
      types?: string[];
      distanceMeters?: number;
    };
  }>;
};

export type GooglePlacesSearchResponse = {
  places?: GooglePlace[];
};

export type GooglePlaceDetailsResponse = GooglePlace;

export function normalizePredictionResponse(response: GoogleAutocompleteResponse): PlacePrediction[] {
  const predictions: PlacePrediction[] = [];

  response.suggestions?.forEach((suggestion) => {
    const prediction = suggestion.placePrediction;

    if (!prediction?.placeId || !prediction.text?.text) {
      return;
    }

    predictions.push({
      placeId: prediction.placeId,
      text: prediction.text.text,
      mainText: prediction.structuredFormat?.mainText?.text ?? prediction.text.text,
      secondaryText: prediction.structuredFormat?.secondaryText?.text,
      types: prediction.types,
      distanceMeters: prediction.distanceMeters,
    });
  });

  return predictions;
}

export function normalizeGooglePlace(place: GooglePlace): PlannerPlace | null {
  if (!place.id || !place.displayName?.text || !place.location) {
    return null;
  }

  return {
    id: place.id,
    placeId: place.id,
    name: place.displayName.text,
    address: place.formattedAddress ?? place.shortFormattedAddress,
    location: place.location,
    googleMapsUri: place.googleMapsUri ?? place.googleMapsLinks?.placeUri,
    primaryType: place.primaryType,
    types: place.types,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    openNow: place.currentOpeningHours?.openNow ?? null,
    evChargeOptions: place.evChargeOptions,
    source: "google",
    stopMinutes: place.evChargeOptions ? 35 : 45,
    chargeTargetPercent: place.evChargeOptions ? 85 : undefined,
  };
}

export function normalizePlacesSearchResponse(response: GooglePlacesSearchResponse): PlannerPlace[] {
  return response.places?.map(normalizeGooglePlace).filter((place): place is PlannerPlace => place !== null) ?? [];
}
