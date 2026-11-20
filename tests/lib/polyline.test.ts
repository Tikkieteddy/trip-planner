import { describe, expect, it } from "vitest";
import { decodePolyline, encodePolyline, interleave, splitEncodedPolyline, splitPolylineByDistance } from "@/lib/polyline";

// Reference example from Google's Encoded Polyline Algorithm documentation.
const googleExample = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
const googlePoints = [
  { latitude: 38.5, longitude: -120.2 },
  { latitude: 40.7, longitude: -120.95 },
  { latitude: 43.252, longitude: -126.453 },
];

function longRoute(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    latitude: 13.75 - index * 0.0137,
    longitude: 100.5 + Math.sin(index / 7) * 0.0213,
  }));
}

describe("encodePolyline / decodePolyline", () => {
  it("matches Google's reference encoding", () => {
    expect(encodePolyline(googlePoints)).toBe(googleExample);
    expect(decodePolyline(googleExample)).toEqual(googlePoints);
  });

  it("round-trips points at 5-decimal precision", () => {
    const points = longRoute(50).map((point) => ({
      latitude: Math.round(point.latitude * 1e5) / 1e5,
      longitude: Math.round(point.longitude * 1e5) / 1e5,
    }));
    expect(decodePolyline(encodePolyline(points))).toEqual(points);
  });

  it("returns no points for an empty string", () => {
    expect(decodePolyline("")).toEqual([]);
  });
});

describe("splitEncodedPolyline", () => {
  it("returns the input unchanged when it already fits", () => {
    expect(splitEncodedPolyline(googleExample, 100)).toEqual([googleExample]);
  });

  it("splits a long route into connected segments within the length limit", () => {
    const points = longRoute(400);
    const encoded = encodePolyline(points);
    const maxLength = 300;
    const segments = splitEncodedPolyline(encoded, maxLength, 50);

    expect(encoded.length).toBeGreaterThan(maxLength);
    expect(segments.length).toBeGreaterThan(1);
    for (const segment of segments) expect(segment.length).toBeLessThanOrEqual(maxLength);

    const decoded = segments.map(decodePolyline);
    for (let index = 1; index < decoded.length; index += 1) {
      expect(decoded[index][0]).toEqual(decoded[index - 1].at(-1));
    }
    const all = decodePolyline(encoded);
    expect(decoded[0][0]).toEqual(all[0]);
    expect(decoded.at(-1)?.at(-1)).toEqual(all.at(-1));
  });

  it("stops at maxSegments for very long routes", () => {
    const encoded = encodePolyline(longRoute(400));
    expect(splitEncodedPolyline(encoded, 100, 3)).toHaveLength(3);
  });

  it("keeps the 20,000-character charger request limit for long trips", () => {
    const encoded = encodePolyline(longRoute(8000));
    const segments = splitEncodedPolyline(encoded, 20000);

    expect(encoded.length).toBeGreaterThan(20000);
    for (const segment of segments) expect(segment.length).toBeLessThanOrEqual(20000);
  });
});

describe("splitPolylineByDistance", () => {
  // longRoute steps about 1.5 km per point, so 40 points is about 60 km.
  function segmentKm(segment: string) {
    const points = decodePolyline(segment);
    let meters = 0;
    for (let index = 1; index < points.length; index += 1) {
      const dLat = (points[index].latitude - points[index - 1].latitude) * 111_195;
      const dLng = (points[index].longitude - points[index - 1].longitude) * 111_195 * Math.cos((points[index].latitude * Math.PI) / 180);
      meters += Math.hypot(dLat, dLng);
    }
    return meters / 1000;
  }

  it("splits a short route that fits one request into parts of similar distance", () => {
    const all = longRoute(40);
    const encoded = encodePolyline(all);
    const segments = splitPolylineByDistance(encoded, { targetSegmentKm: 40, maxSegments: 10, maxLength: 18000 });

    expect(segments).toHaveLength(2);
    const [first, second] = segments.map(segmentKm);
    expect(Math.abs(first - second)).toBeLessThan(5);

    const decoded = segments.map(decodePolyline);
    expect(decoded[0][0]).toEqual(decodePolyline(encoded)[0]);
    expect(decoded[1][0]).toEqual(decoded[0].at(-1));
    expect(decoded[1].at(-1)).toEqual(decodePolyline(encoded).at(-1));
  });

  it("keeps a route shorter than one part whole", () => {
    const encoded = encodePolyline(longRoute(10));
    expect(splitPolylineByDistance(encoded, { targetSegmentKm: 40, maxSegments: 10, maxLength: 18000 })).toEqual([encoded]);
  });

  it("caps distance-based parts at maxDistanceSegments and still reaches the end", () => {
    const encoded = encodePolyline(longRoute(400));
    const segments = splitPolylineByDistance(encoded, {
      targetSegmentKm: 40,
      maxSegments: 10,
      maxDistanceSegments: 6,
      maxLength: 18000,
    });

    expect(segments).toHaveLength(6);
    expect(decodePolyline(segments.at(-1)!).at(-1)).toEqual(decodePolyline(encoded).at(-1));
  });

  it("adds parts beyond the distance cap only to fit the length limit", () => {
    const encoded = encodePolyline(longRoute(400));
    const segments = splitPolylineByDistance(encoded, {
      targetSegmentKm: 1000,
      maxSegments: 10,
      maxDistanceSegments: 1,
      maxLength: Math.ceil(encoded.length / 3),
    });

    expect(segments.length).toBeGreaterThan(1);
    for (const segment of segments) expect(segment.length).toBeLessThanOrEqual(Math.ceil(encoded.length / 3));
  });
});

describe("interleave", () => {
  it("takes items from each list in turn", () => {
    expect(interleave([["a1", "a2", "a3"], ["b1"], [], ["c1", "c2"]])).toEqual(["a1", "b1", "c1", "a2", "c2", "a3"]);
  });

  it("returns an empty list for no input", () => {
    expect(interleave([])).toEqual([]);
  });
});
