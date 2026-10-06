import { Redis } from "@upstash/redis";
import { z } from "zod";
import { savedRouteLibrarySchema } from "@/lib/schemas";
import type { SavedRoute } from "@/types/trip";

const cloudRouteRecordSchema = z.object({
  routes: savedRouteLibrarySchema,
  updatedAt: z.string().datetime(),
});

const legacyClerkUsersSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string(),
      verification: z.object({ status: z.string() }).passthrough().nullable(),
    })),
  })),
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

export async function readLegacyClerkRoutes(email: string) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const url = new URL("https://api.clerk.com/v1/users");
  url.searchParams.set("email_address", email);
  url.searchParams.set("limit", "10");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });
  if (!response.ok) return null;

  const parsedUsers = legacyClerkUsersSchema.safeParse(await response.json().catch(() => null));
  if (!parsedUsers.success) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const matchingUsers = parsedUsers.data.data.filter((legacyUser) =>
    legacyUser.email_addresses.some((entry) =>
      entry.email_address.trim().toLowerCase() === normalizedEmail && entry.verification?.status === "verified",
    ),
  );
  if (matchingUsers.length !== 1) return null;

  const legacyUser = matchingUsers[0];
  return {
    userId: legacyUser.id,
    routes: await readCloudRoutes(legacyUser.id),
  };
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
