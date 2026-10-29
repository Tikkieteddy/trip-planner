import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, savedRoute } from "../fixtures";

const { getSession, readCloudRoutes, writeCloudRoutes, readLegacyClerkRoutes } = vi.hoisted(() => ({
  getSession: vi.fn(),
  readCloudRoutes: vi.fn(),
  writeCloudRoutes: vi.fn(),
  readLegacyClerkRoutes: vi.fn(),
}));

vi.mock("@/lib/auth0", () => ({ auth0: { getSession } }));
vi.mock("@/lib/cloud-routes", () => ({ readCloudRoutes, writeCloudRoutes, readLegacyClerkRoutes }));

const { GET, PUT } = await import("@/app/api/cloud-routes/route");

const url = "http://localhost/api/cloud-routes";
const session = (user: Record<string, unknown>) => ({ user });

beforeEach(() => {
  getSession.mockReset();
  readCloudRoutes.mockReset().mockResolvedValue([]);
  writeCloudRoutes.mockReset().mockImplementation(async (_userId: string, routes: unknown[]) => ({ routes, updatedAt: "2026-10-29T00:00:00.000Z" }));
  readLegacyClerkRoutes.mockReset().mockResolvedValue(null);
});

describe("GET /api/cloud-routes", () => {
  it("returns 401 without a session and never touches storage", async () => {
    getSession.mockResolvedValue(null);
    const response = await GET();

    expect(response.status).toBe(401);
    expect(readCloudRoutes).not.toHaveBeenCalled();
  });

  it("reads routes for the session user only, without caching", async () => {
    getSession.mockResolvedValue(session({ sub: "auth0|alice" }));
    readCloudRoutes.mockResolvedValue([savedRoute("a")]);
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(readCloudRoutes).toHaveBeenCalledWith("auth0|alice");
    expect((await response.json()).routes).toHaveLength(1);
  });

  it("returns 503 when storage fails", async () => {
    getSession.mockResolvedValue(session({ sub: "auth0|alice" }));
    readCloudRoutes.mockRejectedValue(new Error("redis down"));

    expect((await GET()).status).toBe(503);
  });

  it("migrates legacy Clerk routes only for a verified email", async () => {
    readLegacyClerkRoutes.mockResolvedValue({ userId: "user_legacy", routes: [savedRoute("old")] });

    getSession.mockResolvedValue(session({ sub: "auth0|alice", email: "a@example.test", email_verified: false }));
    await GET();
    expect(readLegacyClerkRoutes).not.toHaveBeenCalled();

    getSession.mockResolvedValue(session({ sub: "auth0|alice", email: "a@example.test", email_verified: true }));
    const response = await GET();
    expect(writeCloudRoutes).toHaveBeenCalledWith("auth0|alice", [savedRoute("old")]);
    expect((await response.json()).routes).toHaveLength(1);
  });

  it("does not migrate when the user already has cloud routes", async () => {
    getSession.mockResolvedValue(session({ sub: "auth0|alice", email: "a@example.test", email_verified: true }));
    readCloudRoutes.mockResolvedValue([savedRoute("a")]);
    await GET();

    expect(readLegacyClerkRoutes).not.toHaveBeenCalled();
    expect(writeCloudRoutes).not.toHaveBeenCalled();
  });
});

describe("PUT /api/cloud-routes", () => {
  it("returns 401 without a session", async () => {
    getSession.mockResolvedValue(null);
    const response = await PUT(jsonRequest(url, { routes: [] }, "PUT"));

    expect(response.status).toBe(401);
    expect(writeCloudRoutes).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads and libraries over 25 routes", async () => {
    getSession.mockResolvedValue(session({ sub: "auth0|alice" }));
    const tooMany = Array.from({ length: 26 }, (_, index) => savedRoute(String(index)));

    expect((await PUT(jsonRequest(url, "not json", "PUT"))).status).toBe(400);
    expect((await PUT(jsonRequest(url, { routes: tooMany }, "PUT"))).status).toBe(400);
    expect(writeCloudRoutes).not.toHaveBeenCalled();
  });

  it("writes under the session user, ignoring any user id in the body", async () => {
    getSession.mockResolvedValue(session({ sub: "auth0|alice" }));
    const response = await PUT(jsonRequest(url, { userId: "auth0|mallory", routes: [savedRoute("a")] }, "PUT"));

    expect(response.status).toBe(200);
    expect(writeCloudRoutes).toHaveBeenCalledTimes(1);
    expect(writeCloudRoutes.mock.calls[0][0]).toBe("auth0|alice");
  });
});
