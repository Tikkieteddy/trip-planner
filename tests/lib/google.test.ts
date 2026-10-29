import { describe, expect, it, vi } from "vitest";
import { GoogleApiError, googleJson } from "@/lib/google";

const request = { url: "https://example.test/google", body: { q: 1 }, fieldMask: "places.id" };

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("googleJson", () => {
  it("fails with 503 before any request when the server key is missing", async () => {
    vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "");
    const fetchMock = stubFetch(Response.json({}));

    await expect(googleJson(request)).rejects.toMatchObject({ name: "GoogleApiError", statusCode: 503 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the server key and field mask as headers", async () => {
    vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-server-key");
    const fetchMock = stubFetch(Response.json({ ok: true }));

    await expect(googleJson(request)).resolves.toEqual({ ok: true });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.headers).toMatchObject({ "X-Goog-Api-Key": "test-server-key", "X-Goog-FieldMask": "places.id" });
    expect(init.body).toBe(JSON.stringify(request.body));
  });

  it.each([
    ["RESOURCE_EXHAUSTED", 429],
    ["PERMISSION_DENIED", 403],
    ["INVALID_ARGUMENT", 400],
    ["INTERNAL", 502],
  ])("maps Google status %s to HTTP %i", async (status, statusCode) => {
    vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-server-key");
    stubFetch(Response.json({ error: { status, message: "detail" } }, { status: 400 }));

    const error = await googleJson(request).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(GoogleApiError);
    expect(error).toMatchObject({ statusCode });
  });

  it("wraps network failures as 502", async () => {
    vi.stubEnv("GOOGLE_MAPS_SERVER_KEY", "test-server-key");
    stubFetch(new TypeError("network down"));

    await expect(googleJson(request)).rejects.toMatchObject({ statusCode: 502 });
  });
});
