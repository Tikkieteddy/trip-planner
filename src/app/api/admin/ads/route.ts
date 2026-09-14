import { z } from "zod";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { readAdConfig, writeAdConfig } from "@/lib/ads";

export const dynamic = "force-dynamic";

const adConfigSchema = z.object({
  enabled: z.boolean(),
  mobileScript: z.string().max(30000),
  desktopScript: z.string().max(30000),
});

export async function GET() {
  if (!(await isAdminSessionValid())) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  try {
    const result = await readAdConfig();
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "อ่านข้อมูลโฆษณาไม่สำเร็จ กรุณาตรวจการเชื่อมต่อ Redis" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSessionValid())) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const parsed = adConfigSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "สคริปต์โฆษณาแต่ละขนาดต้องมีความยาวไม่เกิน 30,000 ตัวอักษร" }, { status: 400 });

  const config = {
    ...parsed.data,
    mobileScript: parsed.data.mobileScript.trim(),
    desktopScript: parsed.data.desktopScript.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (config.enabled && (!config.mobileScript || !config.desktopScript)) {
    return Response.json({ error: "ใส่โค้ดโฆษณาทั้งมือถือและเดสก์ท็อปก่อนเปิดแสดงผล" }, { status: 400 });
  }
  try {
    await writeAdConfig(config);
    return Response.json({ config });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" }, { status: 503 });
  }
}
