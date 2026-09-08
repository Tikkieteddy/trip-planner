import { googleJson, GoogleApiError } from "@/lib/google";
import { normalizeGooglePlace, type GooglePlaceDetailsResponse } from "@/lib/google-place";
import { placeDetailsRequestSchema } from "@/lib/schemas";

function errorResponse(error: unknown) {
  if (error instanceof GoogleApiError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }

  return Response.json({ error: "ไม่สามารถโหลดรายละเอียดสถานที่ได้" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = placeDetailsRequestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: "Place ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const response = await googleJson<GooglePlaceDetailsResponse>({
      url: `https://places.googleapis.com/v1/places/${encodeURIComponent(parsed.data.placeId)}?languageCode=th&regionCode=TH`,
      method: "GET",
      fieldMask:
        "id,displayName,formattedAddress,location,googleMapsUri,primaryType,types,rating,userRatingCount,currentOpeningHours.openNow,evChargeOptions",
    });
    const place = normalizeGooglePlace(response);

    if (!place) {
      return Response.json({ error: "Google ไม่ได้ส่งพิกัดหรือรายละเอียดสถานที่ที่จำเป็นกลับมา" }, { status: 502 });
    }

    return Response.json({ place });
  } catch (error) {
    return errorResponse(error);
  }
}
