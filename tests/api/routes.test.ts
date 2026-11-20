import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleApiError } from "@/lib/google";
import { bangkok, huaHin, jsonRequest, place } from "../fixtures";

const { googleJson } = vi.hoisted(() => ({ googleJson: vi.fn() }));
vi.mock("@/lib/google", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/google")>()),
  googleJson,
}));

const { POST } = await import("@/app/api/routes/route");

const url = "http://localhost/api/routes";

beforeEach(() => {
  googleJson.mockReset();
});

describe("POST /api/routes", () => {
  it("returns 400 for invalid input without calling Google", async () => {
    const response = await POST(jsonRequest(url, {}));

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/^ข้อมูลเส้นทางไม่ถูกต้อง/);
    expect(googleJson).not.toHaveBeenCalled();
  });

  it("rejects identical origin and destination", async () => {
    const samePlaceId = await POST(jsonRequest(url, { origin: bangkok, destination: { ...huaHin, placeId: bangkok.placeId } }));
    const sameLocation = await POST(jsonRequest(url, { origin: bangkok, destination: place("near", 13.75632, 100.50182) }));

    expect(samePlaceId.status).toBe(400);
    expect(sameLocation.status).toBe(400);
    expect(googleJson).not.toHaveBeenCalled();
  });

  it("maps a Google route into the planner response", async () => {
    googleJson.mockResolvedValue({
      routes: [{
        distanceMeters: 200000,
        duration: "9000s",
        polyline: { encodedPolyline: "_p~iF~ps|U_ulLnnqC" },
        legs: [{ distanceMeters: 200000, staticDuration: "8800s" }],
      }],
    });
    const response = await POST(jsonRequest(url, { origin: bangkok, destination: huaHin, avoidTolls: true }));

    expect(response.status).toBe(200);
    expect((await response.json()).route).toEqual({
      distanceMeters: 200000,
      duration: "9000s",
      encodedPolyline: "_p~iF~ps|U_ulLnnqC",
      legs: [{ distanceMeters: 200000, duration: "8800s", staticDuration: "8800s" }],
      optimizedWaypointOrder: [],
      warnings: [],
    });
    const body = googleJson.mock.calls[0][0].body;
    expect(body.routeModifiers.avoidTolls).toBe(true);
    expect(body.optimizeWaypointOrder).toBe(false);
  });

  it("returns 502 when Google finds no usable route", async () => {
    googleJson.mockResolvedValue({ routes: [] });
    expect((await POST(jsonRequest(url, { origin: bangkok, destination: huaHin }))).status).toBe(502);
  });

  it("passes through Google API error status codes", async () => {
    googleJson.mockRejectedValue(new GoogleApiError("quota", 429));
    const response = await POST(jsonRequest(url, { origin: bangkok, destination: huaHin }));

    expect(response.status).toBe(429);
    expect((await response.json()).error).toBe("quota");
  });
});
