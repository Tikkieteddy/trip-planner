import { readAdConfig } from "@/lib/ads";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { config } = await readAdConfig();
    return Response.json({
      enabled: config.enabled,
      mobileScript: config.enabled ? config.mobileScript : "",
      desktopScript: config.enabled ? config.desktopScript : "",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ enabled: false, mobileScript: "", desktopScript: "" }, { headers: { "Cache-Control": "no-store" } });
  }
}
