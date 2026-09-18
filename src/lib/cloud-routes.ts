import { Redis } from "@upstash/redis";
import { z } from "zod";
import { savedRouteLibrarySchema } from "@/lib/schemas";
import type { SavedRoute } from "@/types/trip";

const cloudRouteRecordSchema = z.object({
  routes: savedRouteLibrarySchema,
  updatedAt: z.string().datetime(),
});

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  return url && token ? new Redis({ url, token }) : null;
}

function getCloudRouteKey(userId: string) {
  return `trip-planner:cloud-routes:v1:${userId}`;
}

export function isCloudRouteStorageConfigured() {
  return Boolean(getRedis());
}

export async function readCloudRoutes(userId: string) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("ยังไม่ได้เชื่อม Upstash Redis กับโปรเจกต์ Vercel");
  }

  const stored = await redis.get<unknown>(getCloudRouteKey(userId));
  if (!stored) return [];

  const parsed = cloudRouteRecordSchema.safeParse(stored);
  if (!parsed.success) {
    throw new Error("ข้อมูล Route ใน Cloud ไม่อยู่ในรูปแบบที่ระบบรองรับ");
  }

  return parsed.data.routes as SavedRoute[];
}

export async function writeCloudRoutes(userId: string, routes: SavedRoute[]) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("ยังไม่ได้เชื่อม Upstash Redis กับโปรเจกต์ Vercel");
  }

  const record = {
    routes,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(getCloudRouteKey(userId), record);
  return record;
}
