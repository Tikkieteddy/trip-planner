import { readAdConfig } from "@/lib/ads";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { config } = await readAdConfig();
    return Response.json({ enabled: config.enabled, script: config.enabled ? config.script : "" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ enabled: false, script: "" }, { headers: { "Cache-Control": "no-store" } });
  }
}
