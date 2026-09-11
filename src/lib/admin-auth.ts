import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "tikkie_ads_admin";
const sessionDurationSeconds = 60 * 60 * 8;

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

function getSecret() {
  return process.env.ADS_ADMIN_SESSION_SECRET ?? "";
}

export function isCorrectAdminPassword(password: string) {
  const expected = process.env.ADS_ADMIN_PASSWORD ?? "";
  return expected.length >= 10 && safeEqual(password, expected);
}

export function createAdminSessionToken() {
  const secret = getSecret();
  if (secret.length < 32) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const signature = createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
  return { value: `${expiresAt}.${signature}`, maxAge: sessionDurationSeconds };
}

export async function isAdminSessionValid() {
  const secret = getSecret();
  const token = (await cookies()).get(adminCookieName)?.value;
  if (!token || secret.length < 32) return false;

  const [expiresAtText, signature = ""] = token.split(".");
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() / 1000) return false;

  const expected = createHmac("sha256", secret).update(expiresAtText).digest("hex");
  return safeEqual(signature, expected);
}
