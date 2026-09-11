import { z } from "zod";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { readAdConfig, writeAdConfig } from "@/lib/ads";

export const dynamic = "force-dynamic";

const adConfigSchema = z.object({ enabled: z.boolean(), script: z.string().max(30000) });

export async function GET() {
  if (!(await isAdminSessionValid())) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const result = await readAdConfig();
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdminSessionValid())) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const parsed = adConfigSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "สคริปต์โฆษณาต้องมีความยาวไม่เกิน 30,000 ตัวอักษร" }, { status: 400 });

  const config = { ...parsed.data, script: parsed.data.script.trim(), updatedAt: new Date().toISOString() };
  try {
    await writeAdConfig(config);
    return Response.json({ config });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" }, { status: 503 });
  }
}
