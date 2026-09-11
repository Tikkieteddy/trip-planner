import { Redis } from "@upstash/redis";

export type AdConfig = {
  enabled: boolean;
  script: string;
  updatedAt: string | null;
};

const adConfigKey = "trip-planner:ads:primary";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  return url && token ? new Redis({ url, token }) : null;
}

function getEnvironmentConfig(): AdConfig {
  const script = process.env.AD_SCRIPT_HTML?.trim() ?? "";

  return {
    enabled: Boolean(script),
    script,
    updatedAt: null,
  };
}

export async function readAdConfig() {
  const redis = getRedis();

  if (!redis) {
    return { config: getEnvironmentConfig(), storageReady: false };
  }

  const stored = await redis.get<AdConfig>(adConfigKey);
  return { config: stored ?? getEnvironmentConfig(), storageReady: true };
}

export async function writeAdConfig(config: AdConfig) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("ยังไม่ได้เชื่อม Upstash Redis กับโปรเจกต์ Vercel");
  }

  await redis.set(adConfigKey, config);
}
