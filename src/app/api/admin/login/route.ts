import { adminCookieName, createAdminSessionToken, isCorrectAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !isCorrectAdminPassword(body.password)) {
    return Response.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return Response.json({ error: "ยังไม่ได้ตั้งค่า ADS_ADMIN_SESSION_SECRET อย่างน้อย 32 ตัวอักษร" }, { status: 503 });
  }

  const response = Response.json({ ok: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${adminCookieName}=${token.value}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${token.maxAge}`);
  return response;
}
