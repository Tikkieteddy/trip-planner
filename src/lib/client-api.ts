import type { ApiErrorResponse } from "@/types/trip";

export async function postJson<TResponse>(url: string, body: unknown, signal?: AbortSignal): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as (ApiErrorResponse & TResponse) | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "คำขอไม่สำเร็จ");
  }

  return payload as TResponse;
}
