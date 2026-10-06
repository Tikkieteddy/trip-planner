import { z } from "zod";
import { auth0 } from "@/lib/auth0";
import { readCloudRoutes, readLegacyClerkRoutes, writeCloudRoutes } from "@/lib/cloud-routes";
import { savedRouteLibrarySchema } from "@/lib/schemas";
import type { SavedRoute } from "@/types/trip";

export const dynamic = "force-dynamic";

const updateCloudRoutesSchema = z.object({
  routes: savedRouteLibrarySchema,
});

export async function GET() {
  const session = await auth0.getSession();
  const userId = session?.user.sub;
  if (!userId) return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนใช้ Cloud Sync" }, { status: 401 });

  try {
    let routes = await readCloudRoutes(userId);
    if (routes.length === 0 && session?.user.email_verified && session.user.email) {
      const legacy = await readLegacyClerkRoutes(session.user.email);
      if (legacy && legacy.userId !== userId && legacy.routes.length > 0) {
        routes = legacy.routes;
        await writeCloudRoutes(userId, routes);
      }
    }
    return Response.json({ routes }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "อ่าน Route จาก Cloud ไม่สำเร็จ" },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth0.getSession();
  const userId = session?.user.sub;
  if (!userId) return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนใช้ Cloud Sync" }, { status: 401 });

  const parsed = updateCloudRoutesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "ข้อมูล Route ที่จะซิงก์ไม่ถูกต้อง" }, { status: 400 });

  try {
    const record = await writeCloudRoutes(userId, parsed.data.routes as SavedRoute[]);
    return Response.json(record, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "บันทึก Route ใน Cloud ไม่สำเร็จ" },
      { status: 503 },
    );
  }
}
