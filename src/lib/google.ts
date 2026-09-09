const GOOGLE_TIMEOUT_MS = 12000;

export class GoogleApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "GoogleApiError";
    this.statusCode = statusCode;
  }
}

function requireServerKey() {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  if (!apiKey) {
    throw new GoogleApiError("ยังไม่ได้ตั้งค่า GOOGLE_MAPS_SERVER_KEY", 503);
  }

  return apiKey;
}

function statusCodeFromGoogleStatus(status?: string) {
  if (status === "RESOURCE_EXHAUSTED") {
    return 429;
  }

  if (status === "PERMISSION_DENIED" || status === "UNAUTHENTICATED") {
    return 403;
  }

  if (status === "INVALID_ARGUMENT" || status === "FAILED_PRECONDITION") {
    return 400;
  }

  return 502;
}

async function parseJsonSafely(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function googleJson<TResponse>({
  url,
  body,
  method = "POST",
  fieldMask,
}: {
  url: string;
  body?: unknown;
  method?: "GET" | "POST";
  fieldMask?: string;
}): Promise<TResponse> {
  const apiKey = requireServerKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
      },
    });

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      const googleError = payload as { error?: { status?: string; message?: string } } | null;
      const status = googleError?.error?.status;
      const googleMessage = googleError?.error?.message;
      const statusCode = statusCodeFromGoogleStatus(status);
      const friendlyMessage =
        statusCode === 429
          ? "Google API ใช้งานเกินโควตาหรือถูกจำกัดชั่วคราว"
          : statusCode === 403
            ? "Google API key ไม่มีสิทธิ์เรียกบริการนี้หรือถูกปฏิเสธ"
            : statusCode === 400
              ? "ข้อมูลที่ส่งไปยัง Google API ไม่ถูกต้อง"
              : "Google API ตอบกลับไม่สำเร็จ";

      throw new GoogleApiError(googleMessage ? `${friendlyMessage}: ${googleMessage}` : friendlyMessage, statusCode);
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof GoogleApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GoogleApiError("Google API ใช้เวลาตอบกลับนานเกินไป", 504);
    }

    throw new GoogleApiError("ไม่สามารถติดต่อ Google API ได้", 502);
  } finally {
    clearTimeout(timeout);
  }
}
