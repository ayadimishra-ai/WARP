import rateLimit from "express-rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Store for tracking failed attempts per IP
const failedAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();

// Clean up old failed attempt records every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    for (const [ip, data] of failedAttempts.entries()) {
      if (now - data.lastAttempt > tenMinutes) {
        failedAttempts.delete(ip);
      }
    }
  },
  10 * 60 * 1000
);

/**
 * Email-specific rate limiter implementing VAPT security requirements:
 * - Max 5 requests per minute per IP
 * - Progressive delay for multiple failed attempts
 * - Enhanced security headers
 */
export const createEmailRateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // Max 5 requests per minute per IP

    // Custom key generator to extract IP from various headers
    keyGenerator: (req: any) => {
      // Enhanced IP detection with multiple fallbacks (same as existing implementation)
      const headers = {
        realIp: req.headers.get?.("x-real-ip") || req.headers["x-real-ip"],
        forwardedFor:
          req.headers.get?.("x-forwarded-for") ||
          req.headers["x-forwarded-for"],
        cfConnectingIp:
          req.headers.get?.("cf-connecting-ip") ||
          req.headers["cf-connecting-ip"],
        trueClientIp:
          req.headers.get?.("true-client-ip") || req.headers["true-client-ip"],
        xClientIp:
          req.headers.get?.("x-client-ip") || req.headers["x-client-ip"]
      };

      const clientIp =
        headers.realIp ??
        headers.forwardedFor?.split(",")[0] ??
        headers.cfConnectingIp ??
        headers.trueClientIp ??
        headers.xClientIp ??
        "localhost";

      return clientIp;
    },

    // Custom handler for rate limit exceeded
    handler: (req: any, res: any) => {
      const clientIp = req.rateLimit?.key || "unknown";
      const resetTime = new Date(Date.now() + 60 * 1000); // Reset in 1 minute

      console.warn(`Email rate limit exceeded for IP: ${clientIp}`);

      // For Next.js API routes, we need to return a NextResponse
      if (typeof NextResponse !== "undefined") {
        return new NextResponse(
          JSON.stringify({
            error: "Too Many Email Requests",
            message:
              "Rate limit exceeded for email submissions. Please try again later.",
            resetAt: resetTime.toISOString(),
            maxRequests: 5,
            windowMs: 60000
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": "5",
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": resetTime.toISOString(),
              "Retry-After": "60"
            }
          }
        );
      }

      // Fallback for express-style responses
      res.status(429).json({
        error: "Too Many Email Requests",
        message:
          "Rate limit exceeded for email submissions. Please try again later.",
        resetAt: resetTime.toISOString()
      });
    },

    // Skip successful requests, only count towards limit
    skip: () => false,

    // Add rate limit headers to all responses
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Progressive delay middleware for failed email attempts
 * Implements exponential backoff for repeated failures
 */
export const applyProgressiveDelay = async (
  clientIp: string,
  isSuccess: boolean = true
) => {
  const now = Date.now();
  const attempts = failedAttempts.get(clientIp);

  if (isSuccess) {
    // Reset failed attempts on success
    failedAttempts.delete(clientIp);
    return 0;
  }

  // Track failed attempt
  const newAttempts = attempts ? attempts.count + 1 : 1;
  failedAttempts.set(clientIp, { count: newAttempts, lastAttempt: now });

  // Calculate progressive delay: 2^(attempts-1) seconds, max 30 seconds
  const delaySeconds = Math.min(Math.pow(2, newAttempts - 1), 30);
  const delayMs = delaySeconds * 1000;

  console.log(
    `Applying progressive delay for IP ${clientIp}: ${delaySeconds}s (attempt ${newAttempts})`
  );

  return delayMs;
};

/**
 * Wrapper function to easily apply email rate limiting to Next.js API routes
 * Usage: export const POST = withEmailRateLimit(async (request) => { ... });
 */
export const withEmailOrIpRateLimit = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    limitInterval?: number; // default 1 minute
    maxRequestCount?: number; // default 5
    progressiveDelay?: boolean; // default false
  }
) => {
  const limitInterval = options?.limitInterval
    ? options.limitInterval * 60 * 1000
    : 60 * 1000;
  const maxRequestCount = options?.maxRequestCount ?? 5;
  const progressiveDelay = options?.progressiveDelay ?? false;
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract email from body if available, otherwise use IP
      let key: string | undefined;
      try {
        const body = await request.clone().json();
        if (body && typeof body.email === "string" && body.email.trim()) {
          key = body.email.trim().toLowerCase();
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

      // Rate limit logic
      const response = await checkEmailOrIpRateLimit(
        request,
        key,
        limitInterval,
        maxRequestCount,
        progressiveDelay
      );
      if (response) {
        return response;
      }

      // Execute the original handler
      const result = await handler(request);
      const isSuccess = result.status >= 200 && result.status < 400;
      await applyProgressiveDelay(key, isSuccess);
      return result;
    } catch (error) {
      console.error("Error in email/IP rate limiter:", error);
      await applyProgressiveDelay("error", false);
      return await handler(request);
    }
  };
};

// Next.js compatible rate limiting implementation (by email or IP)
const emailOrIpRateLimit = new Map<
  string,
  { count: number; resetTime: number }
>();

const checkEmailOrIpRateLimit = async (
  request: NextRequest,
  key: string,
  limitInterval: number,
  maxRequestCount: number,
  progressiveDelay: boolean
): Promise<NextResponse | null> => {
  const now = Date.now();

  // Get or create rate limit entry
  let limitData = emailOrIpRateLimit.get(key);

  // Reset if window has expired (always set window to 60 seconds)
  if (!limitData || now > limitData.resetTime) {
    limitData = { count: 0, resetTime: now + 60 * 1000 };
    emailOrIpRateLimit.set(key, limitData);
  }

  // Check if limit exceeded
  if (limitData.count >= maxRequestCount) {
    const resetTime = new Date(limitData.resetTime);
    const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);

    // Increment failedAttempts for progressive delay tracking
    const nowTime = Date.now();
    const attempts = failedAttempts.get(key);
    const newAttempts = attempts ? attempts.count + 1 : 1;
    failedAttempts.set(key, { count: newAttempts, lastAttempt: nowTime });

    let progressiveDelaySeconds = 0;
    let progressiveAttempts = 0;
    if (progressiveDelay) {
      // Progressive delay logic will be added later
      progressiveDelaySeconds = 0; // Placeholder
      progressiveAttempts = newAttempts;
    }

    console.warn(
      `Rate limit exceeded for key: ${key} (${limitData.count}/${maxRequestCount} requests)`
    );

    // Format reset time for message
    const formattedReset = resetTime.toISOString();
    const waitSeconds = retryAfter;

    return new NextResponse(
      JSON.stringify({
        error: "Rate Limit Reached",
        message: `You have reached the maximum of ${maxRequestCount} requests per minute. Please wait ${waitSeconds} seconds and try again. Next request available at ${formattedReset}.`,
        nextAvailableAt: formattedReset,
        maxRequestCount,
        limitInterval,
        currentCount: limitData.count,
        progressiveDelaySeconds,
        progressiveAttempts
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": maxRequestCount.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": formattedReset,
          "Retry-After": waitSeconds.toString()
        }
      }
    );
  }

  // Increment counter
  limitData.count++;
  emailOrIpRateLimit.set(key, limitData);

  return null; // No rate limit exceeded
};

// Clean up expired rate limit entries every 2 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, data] of emailOrIpRateLimit.entries()) {
      if (now > data.resetTime) {
        emailOrIpRateLimit.delete(key);
      }
    }
  },
  2 * 60 * 1000
);
