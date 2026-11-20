import type { LatLng } from "@/types/trip";

function encodeValue(value: number) {
  let encodedValue = value < 0 ? ~(value << 1) : value << 1;
  let output = "";

  while (encodedValue >= 0x20) {
    output += String.fromCharCode((0x20 | (encodedValue & 0x1f)) + 63);
    encodedValue >>= 5;
  }

  return output + String.fromCharCode(encodedValue + 63);
}

export function encodePolyline(points: LatLng[]) {
  let previousLatitude = 0;
  let previousLongitude = 0;

  return points
    .map((point) => {
      const latitude = Math.round(point.latitude * 100000);
      const longitude = Math.round(point.longitude * 100000);
      const encoded = encodeValue(latitude - previousLatitude) + encodeValue(longitude - previousLongitude);

      previousLatitude = latitude;
      previousLongitude = longitude;

      return encoded;
    })
    .join("");
}

export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let byte = 0;
    let shift = 0;
    let result = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    const deltaLatitude = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += deltaLatitude;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    const deltaLongitude = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += deltaLongitude;

    points.push({
      latitude: latitude / 100000,
      longitude: longitude / 100000,
    });
  }

  return points;
}

export function splitEncodedPolyline(encoded: string, maxLength: number, maxSegments = 8) {
  if (encoded.length <= maxLength) {
    return [encoded];
  }

  const points = decodePolyline(encoded);

  if (points.length < 2) {
    return [encoded];
  }

  const segments: string[] = [];
  let startIndex = 0;

  while (startIndex < points.length - 1 && segments.length < maxSegments) {
    let low = startIndex + 1;
    let high = points.length - 1;
    let bestEndIndex = low;
    let bestEncoded = encodePolyline(points.slice(startIndex, low + 1));

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = encodePolyline(points.slice(startIndex, middle + 1));

      if (candidate.length <= maxLength) {
        bestEndIndex = middle;
        bestEncoded = candidate;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    segments.push(bestEncoded);
    startIndex = bestEndIndex;
  }

  return segments;
}

const earthRadiusMeters = 6371000;

function distanceMeters(from: LatLng, to: LatLng) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const halfChord =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(halfChord)));
}

function splitPointsEvenly(points: LatLng[], cumulative: number[], segmentCount: number) {
  const total = cumulative.at(-1) ?? 0;
  const segments: LatLng[][] = [];
  let startIndex = 0;

  for (let segment = 1; segment <= segmentCount; segment += 1) {
    let endIndex = points.length - 1;

    if (segment < segmentCount) {
      const boundary = (total * segment) / segmentCount;
      endIndex = cumulative.findIndex((value, index) => index > startIndex && value >= boundary);
      if (endIndex < 0 || endIndex >= points.length - 1) break;
    }

    segments.push(points.slice(startIndex, endIndex + 1));
    startIndex = endIndex;
    if (endIndex === points.length - 1) break;
  }

  if (startIndex < points.length - 1) segments.push(points.slice(startIndex));
  return segments;
}

/**
 * Split a route into segments of roughly equal road distance so that a
 * search-along-route query covers the whole trip, not just its start.
 * Segments share their boundary point and each encoded segment stays within
 * `maxLength` characters (Google's request limit). Distance alone never asks
 * for more than `maxDistanceSegments` parts (each part costs a Places call);
 * more parts, up to `maxSegments`, are used only to fit `maxLength`. Falls
 * back to the length-based split when even `maxSegments` parts are too long.
 */
export function splitPolylineByDistance(
  encoded: string,
  {
    targetSegmentKm,
    maxSegments,
    maxLength,
    maxDistanceSegments = maxSegments,
  }: { targetSegmentKm: number; maxSegments: number; maxLength: number; maxDistanceSegments?: number },
) {
  const points = decodePolyline(encoded);
  if (points.length < 3) return splitEncodedPolyline(encoded, maxLength, maxSegments);

  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulative.push(cumulative[index - 1] + distanceMeters(points[index - 1], points[index]));
  }

  const totalKm = (cumulative.at(-1) ?? 0) / 1000;
  const byDistance = Math.max(1, Math.ceil(totalKm / targetSegmentKm));

  for (let count = Math.min(maxSegments, maxDistanceSegments, byDistance); count <= maxSegments; count += 1) {
    if (count === 1 && encoded.length <= maxLength) return [encoded];
    const segments = splitPointsEvenly(points, cumulative, count).map(encodePolyline);
    if (segments.every((segment) => segment.length <= maxLength)) return segments;
  }

  return splitEncodedPolyline(encoded, maxLength, maxSegments);
}

/** Round-robin merge: first item of each list, then the second of each, and so on. */
export function interleave<T>(lists: T[][]): T[] {
  const longest = Math.max(0, ...lists.map((list) => list.length));
  const merged: T[] = [];

  for (let index = 0; index < longest; index += 1) {
    for (const list of lists) {
      if (index < list.length) merged.push(list[index]);
    }
  }

  return merged;
}
