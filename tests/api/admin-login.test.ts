import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/login/route";
import { jsonRequest } from "../fixtures";

const url = "http://localhost/api/admin/login";
const password = "correct-horse-battery";

function configure() {
  vi.stubEnv("ADS_ADMIN_PASSWORD", password);
  vi.stubEnv("ADS_ADMIN_SESSION_SECRET", "s".repeat(32));
}

describe("POST /api/admin/login", () => {
  it("returns 503 when CMS credentials are not configured", async () => {
    vi.stubEnv("ADS_ADMIN_PASSWORD", "short");
    vi.stubEnv("ADS_ADMIN_SESSION_SECRET", "");

    expect((await POST(jsonRequest(url, { password: "short" }))).status).toBe(503);
  });

  it("rejects wrong, missing and malformed passwords", async () => {
    configure();

    for (const body of [{ password: "wrong-password-123" }, {}, "not json"]) {
      const response = await POST(jsonRequest(url, body));
      expect(response.status).toBe(401);
      expect(response.headers.get("Set-Cookie")).toBeNull();
    }
  });

  it("sets an HttpOnly, SameSite=Strict signed session cookie on success", async () => {
    configure();
    const response = await POST(jsonRequest(url, { password }));
    const cookie = response.headers.get("Set-Cookie") ?? "";

    expect(response.status).toBe(200);
    expect(cookie).toMatch(/^tikkie_ads_admin=\d+\.[0-9a-f]{64};/);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Max-Age=28800");
  });

  it("marks the cookie Secure in production", async () => {
    configure();
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(jsonRequest(url, { password }));

    expect(response.headers.get("Set-Cookie")).toContain("; Secure");
  });
});
