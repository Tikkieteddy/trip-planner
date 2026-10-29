import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "../fixtures";

const { googleJson } = vi.hoisted(() => ({ googleJson: vi.fn() }));
vi.mock("@/lib/google", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/google")>()),
  googleJson,
}));

const { POST } = await import("@/app/api/places/route");

beforeEach(() => {
  googleJson.mockReset();
});

describe("POST /api/places", () => {
  it.each([
    ["missing mode", {}],
    ["unknown mode", { mode: "everything" }],
    ["short autocomplete input", { mode: "autocomplete", input: "a" }],
    ["oversized charger polyline", { mode: "route-chargers", encodedPolyline: "a".repeat(20001) }],
  ])("returns 400 for %s without calling Google", async (_label, body) => {
    const response = await POST(jsonRequest("http://localhost/api/places", body));

    expect(response.status).toBe(400);
    expect(googleJson).not.toHaveBeenCalled();
  });
});
