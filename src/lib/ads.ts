import { Redis } from "@upstash/redis";

export type AdConfig = {
  enabled: boolean;
  mobileScript: string;
  desktopScript: string;
  updatedAt: string | null;
};

const adConfigKey = "trip-planner:ads:primary";

export function isAdStorageConfigured() {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN),
  );
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  return url && token ? new Redis({ url, token }) : null;
}

function getEnvironmentConfig(): AdConfig {
  const sharedScript = process.env.AD_SCRIPT_HTML?.trim() ?? "";
  const mobileScript = process.env.AD_SCRIPT_HTML_MOBILE?.trim() ?? sharedScript;
  const desktopScript = process.env.AD_SCRIPT_HTML_DESKTOP?.trim() ?? sharedScript;

  return {
    enabled: Boolean(mobileScript && desktopScript),
    mobileScript,
    desktopScript,
    updatedAt: null,
  };
}

function normalizeConfig(stored: AdConfig & { script?: string }): AdConfig {
  const legacyScript = stored.script ?? "";
  return {
    enabled: stored.enabled,
    mobileScript: stored.mobileScript ?? legacyScript,
    desktopScript: stored.desktopScript ?? legacyScript,
    updatedAt: stored.updatedAt,
  };
}

export async function readAdConfig() {
  const redis = getRedis();

  if (!redis) {
    return { config: getEnvironmentConfig(), storageReady: false };
  }

  const stored = await redis.get<AdConfig>(adConfigKey);
  return { config: stored ? normalizeConfig(stored) : getEnvironmentConfig(), storageReady: true };
}

export async function writeAdConfig(config: AdConfig) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("ยังไม่ได้เชื่อม Upstash Redis กับโปรเจกต์ Vercel");
  }

  await redis.set(adConfigKey, config);
}
