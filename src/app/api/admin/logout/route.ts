import { adminCookieName } from "@/lib/admin-auth";

export async function POST() {
  const response = Response.json({ ok: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${adminCookieName}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`);
  return response;
}
