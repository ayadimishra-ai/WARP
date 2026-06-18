import { NextRequest, NextResponse } from "next/server";

// Global stores to persist across hot reloads (dev) and allow serialization.
const g = globalThis as any;
if (!g.__emailIpRequestStore) {
  g.__emailIpRequestStore = new Map<
    string,
    {
      currentRequestCount: number;
      timerInterval: number;
      timer: number;
      resetTime: number;
    }
  >();
}

// Per-key promise chain to serialize requests (prevents overlapping successes after a 429).
if (!g.__emailIpProcessingQueues) {
  g.__emailIpProcessingQueues = new Map<string, Promise<any>>();
}
const processingQueues: Map<string, Promise<any>> = g.__emailIpProcessingQueues;

function enqueueSerial<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = processingQueues.get(key) ?? Promise.resolve();
  const p = prev
    .then(fn)
    .finally(() => {
      // Remove chain if this is last
      if (processingQueues.get(key) === p) {
        processingQueues.delete(key);
      }
    });
  processingQueues.set(key, p);
  return p;
}

export const withEmailOrIpRateLimitWithProgressiveDelay = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    limitInterval?: number; // in minutes
    maxRequestCount?: number;
    progressiveDelay?: boolean;
  }
) => {
  const limitInterval = options?.limitInterval ?? 1; // minutes
  const maxRequestCount = options?.maxRequestCount ?? 5;
  const progressiveDelay = options?.progressiveDelay ?? false;

  const requestStore: Map<
    string,
    {
      currentRequestCount: number;
      timerInterval: number;
      timer: number;
      resetTime: number;
    }
  > = g.__emailIpRequestStore;

  return async (request: NextRequest): Promise<NextResponse> => {
    // Extract key (email or IP)
    let key: string | undefined;
    try {
      const body = await request.clone().json();
      if (
        (body && typeof body.email === "string" && body.email.trim()) ||
        (body && typeof body.EmailId === "string" && body.EmailId.trim()) ||
        (body && typeof body.UserEmailId === "string" && body.UserEmailId.trim())
      ) {
        key = (body.email ?? body.EmailId ?? body.UserEmailId).trim().toLowerCase();
      }
    } catch {}
    if (!key) {
      const headers = {
        realIp: request.headers.get("x-real-ip"),
        forwardedFor: request.headers.get("x-forwarded-for"),
        cfConnectingIp: request.headers.get("cf-connecting-ip"),
        trueClientIp: request.headers.get("true-client-ip"),
        xClientIp: request.headers.get("x-client-ip")
      };
      key =
        headers.realIp ??
        headers.forwardedFor?.split(",")[0] ??
        headers.cfConnectingIp ??
        headers.trueClientIp ??
        headers.xClientIp ??
        "localhost";
    }

    // Serialize all processing for this key to avoid concurrent handler executions producing
    // success responses after a 429.
    return enqueueSerial(key, async () => {
      const now = Date.now();
      let store = requestStore.get(key);

      // Reset if window expired
      if (!store || now > store.resetTime) {
        store = {
          currentRequestCount: 0,
          timerInterval: 0,
          timer: 0,
          resetTime: now + limitInterval * 60 * 1000
        };
        requestStore.set(key, store);
      }

      store.currentRequestCount++;

      // Always start timer after first API call (for both modes)
      if (store.currentRequestCount === 1) {
        store.resetTime = now + limitInterval * 60 * 1000;
        store.timerInterval = limitInterval;
        store.timer = limitInterval;
        requestStore.set(key, store);
      }

      if (!progressiveDelay) {
        // Simple rate limit
        if (store.currentRequestCount > maxRequestCount) {
          const retryAfter = Math.ceil((store.resetTime - now) / 1000);
          return new NextResponse(
            JSON.stringify({
              error: "Rate Limit Reached",
              message: `You have reached the maximum of ${maxRequestCount} requests per ${limitInterval} minute(s). Please wait ${retryAfter} seconds.`,
              nextAvailableAt: new Date(store.resetTime).toLocaleString()
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Limit": maxRequestCount.toString(),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": new Date(store.resetTime).toLocaleString(),
                "Retry-After": retryAfter.toString()
              }
            }
          );
        }
      } else {
        // Progressive delay logic
        if (store.currentRequestCount > maxRequestCount) {
          // Calculate progressive delay interval
            const tempInterval =
            Math.floor((store.currentRequestCount - 1) / maxRequestCount) *
            limitInterval;
          const resetTimer =
            tempInterval > 0 && store.timerInterval !== tempInterval;
          if (resetTimer) {
            store.timerInterval = tempInterval;
            store.timer = tempInterval;
            store.resetTime = now + tempInterval * 60 * 1000;
            requestStore.set(key, store);
          }
          if (store.timer > 0) {
            const retryAfter = Math.ceil((store.resetTime - now) / 1000);
            return new NextResponse(
              JSON.stringify({
                error: "Progressive Delay",
                message: `Too many requests. Please wait ${retryAfter} seconds.`,
                nextAvailableAt: new Date(store.resetTime).toLocaleString(),
                progressiveDelaySeconds: retryAfter
              }),
              {
                status: 429,
                headers: {
                  "Content-Type": "application/json",
                  "X-RateLimit-Limit": maxRequestCount.toString(),
                  "X-RateLimit-Remaining": "0",
                  "X-RateLimit-Reset": new Date(store.resetTime).toLocaleString(),
                  "Retry-After": retryAfter.toString()
                }
              }
            );
          }
        }
      }

      // Call original handler
      return await handler(request);
    });
  };
};
