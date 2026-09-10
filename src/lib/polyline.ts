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
