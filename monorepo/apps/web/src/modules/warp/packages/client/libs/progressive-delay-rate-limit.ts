import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

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
  const p = prev.then(fn).finally(() => {
    // Remove chain if this is last
    if (processingQueues.get(key) === p) {
      processingQueues.delete(key);
    }
  });
  processingQueues.set(key, p);
  return p;
}

export const withEmailOrIpRateLimitWithProgressiveDelay = (
  handler: NextApiHandler,
  options?: {
    limitInterval?: number; // in minutes
    maxRequestCount?: number;
    progressiveDelay?: boolean;
  }
): NextApiHandler => {
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

  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Extract key (email or IP)
    let key: string | undefined;
    try {
      const body = req.body;
      if (
        (body && typeof body.email === "string" && body.email.trim()) ||
        (body && typeof body.EmailId === "string" && body.EmailId.trim()) ||
        (body &&
          typeof body.UserEmailId === "string" &&
          body.UserEmailId.trim())
      ) {
        key = (body.email ?? body.EmailId ?? body.UserEmailId)
          .trim()
          .toLowerCase();
      }
    } catch {}
    const headers = {
      realIp: req.headers["x-real-ip"] as string | undefined,
      forwardedFor: req.headers["x-forwarded-for"] as string | undefined,
      cfConnectingIp: req.headers["cf-connecting-ip"] as string | undefined,
      trueClientIp: req.headers["true-client-ip"] as string | undefined,
      xClientIp: req.headers["x-client-ip"] as string | undefined,
    };
    // Final guaranteed key (email priority, else IP, else localhost)
    const finalKey: string =
      key ??
      headers.realIp ??
      headers.forwardedFor?.split(",")[0] ??
      headers.cfConnectingIp ??
      headers.trueClientIp ??
      headers.xClientIp ??
      "localhost";

    // Serialize all processing for this key to avoid concurrent handler executions producing
    // success responses after a 429.
    return enqueueSerial(finalKey, async () => {
      const now = Date.now();
      let store = requestStore.get(finalKey);

      // Reset if window expired
      if (!store || now > store.resetTime) {
        store = {
          currentRequestCount: 0,
          timerInterval: 0,
          timer: 0,
          resetTime: now + limitInterval * 60 * 1000,
        };
        requestStore.set(finalKey, store);
      }

      store.currentRequestCount++;

      // Always start timer after first API call (for both modes)
      if (store.currentRequestCount === 1) {
        store.resetTime = now + limitInterval * 60 * 1000;
        store.timerInterval = limitInterval;
        store.timer = limitInterval;
        requestStore.set(finalKey, store);
      }

      if (!progressiveDelay) {
        // Simple rate limit
        if (store.currentRequestCount > maxRequestCount) {
          const retryAfter = Math.ceil((store.resetTime - now) / 1000);
          res.status(429).json({
            error: "Rate Limit Reached",
            message: `You have reached the maximum of ${maxRequestCount} requests per ${limitInterval} minute(s). Please wait ${retryAfter} seconds.`,
            nextAvailableAt: new Date(store.resetTime).toLocaleString(),
          });
          return;
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
            requestStore.set(finalKey, store);
          }
          if (store.timer > 0) {
            const retryAfter = Math.ceil((store.resetTime - now) / 1000);
            res.status(429).json({
              error: "Progressive Delay",
              message: `Too many requests. Please wait ${retryAfter} seconds.`,
              nextAvailableAt: new Date(store.resetTime).toLocaleString(),
              progressiveDelaySeconds: retryAfter,
            });
            return;
          }
        }
      }

      // Call original handler
      return await handler(req, res);
    });
  };
};
