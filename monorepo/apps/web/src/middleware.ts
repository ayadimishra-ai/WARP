import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiLogger } from "./lib/api-logger";
import { INTERNAL_AUTH_TOKEN, API_BASE_URL } from "@/constants/auth.constants";

const moduleRoutes = ["/warp/api", "/ghg/api"];

// List of public paths that don't require authentication
const publicPaths = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/register",
    "/forgot-password",
    "/reset-password",
    "/registration",
    "/api/token",
    "/api/session/GetSessionDetails",
    "/api/signIn", //to allow the warp//ops token generation
    "/api/test-rate-limit", // for testing rate limiting
    "/api/metrics", // for monitoring API request statistics
    "/api/internal/verify-token", // Internal token verification endpoint
    "/api/company/cpanel/", //API level authentication is implemented,
    "/api/common/GetSupplierCountryList",
    "/api/common/GetIndexDataGlobalSettings",
    "/api/common/google-invisible-captcha",
    "/api/registration/GetCompanyAccountDataByCPanelId",
    "/api/warp/brsr-template", // internal S3 proxy — no user data exposed
];

// CORS configuration. NOTE: Allow-Credentials is intentionally omitted —
// the SPA uses Bearer tokens, not cookies. Adding it would force browsers
// to reject "*" as Allow-Origin and require a per-origin allow-list.
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
        "rname, languageguid, dashboardtype, companyguid, Content-Type, Authorization, UserEmailId, encryptedemailid, password, UserGuid, ClientIP, userguid, userId, isOpsToken, browserToken, BrowserName, opsCompanyId, warpCompanyId, companyId, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-sk-op-authorization, CPanelCompanyId",
    "Access-Control-Allow-Credentials": "true",
};

/**
 * Verify JWT token by calling internal API route
 * This avoids AWS SDK issues in Edge Runtime
 */
async function verifyToken(token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/internal/verify-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-internal-auth": INTERNAL_AUTH_TOKEN
            },
            body: JSON.stringify({ token })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        const err = error as Error;
        return {
            isValid: false,
            error: err.message || "Token verification failed"
        };
    }
}

import { rateLimiter } from "./lib/rate-limiter";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Extract client IP and user agent for logging
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Start request logging for API routes
    let requestLogger: ReturnType<typeof apiLogger.startRequest> | null = null;
    if (pathname.startsWith('/api/')) {
        requestLogger = apiLogger.startRequest(method, pathname, ip, userAgent);
    }
    // Handle preflight requests
    if (request.method === "OPTIONS") {
        requestLogger?.end(204);
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }


    // Apply rate limiting for API routes
    // if (pathname.startsWith('/api/')) {
    //     const rateLimiterResponse = await rateLimiter(request);
    //     if (rateLimiterResponse) {
    //         return rateLimiterResponse;
    //     }
    // }

    // Skip authentication for public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        requestLogger?.end(200, undefined);
        const response = NextResponse.next();
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        return response;
    }

    console.log("pathname",{ pathname });

    // For API routes, check Authorization header
    if (pathname.startsWith("/api/")) {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            requestLogger?.end(401, "Missing authorization header");
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                    message: "Missing authorization header"
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                        ...corsHeaders
                    }
                }
            );
        }

        // Handle Bearer token JWT verification
        if (authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const object_verifyToken = await verifyToken(token);
            if (!object_verifyToken.isValid) {
                requestLogger?.end(401, object_verifyToken?.error || "Invalid or expired token");
                return new Response(
                    JSON.stringify({
                        error: "Unauthorized",
                        message: object_verifyToken?.error || "Invalid or expired token"
                    }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/json",
                            ...corsHeaders
                        }
                    }
                );
            }
            requestLogger?.end(200, undefined);
            return NextResponse.next();
        }
        // Handle static service-to-service Authorization token
        // The expected value is stored in env (AI_SERVICES_AUTHORIZATION) and
        // compared via a constant-time helper to prevent timing attacks.
        // Note: Edge Runtime does not expose crypto.timingSafeEqual, so we use
        // a character-by-character constant-time comparison instead.
        else if ((() => {
            const expected = process.env.AI_SERVICES_AUTHORIZATION ?? "";
            if (!expected || authHeader.length !== expected.length) return false;
            let diff = 0;
            for (let i = 0; i < expected.length; i++) {
                diff |= authHeader.charCodeAt(i) ^ expected.charCodeAt(i);
            }
            return diff === 0;
        })()) {
            requestLogger?.end(200, undefined);
            return NextResponse.next();
        }
        // Invalid authorization
        else {
            requestLogger?.end(401, "Invalid authorization format or value");
            return new Response(
                JSON.stringify({
                    error: "Unauthorized",
                    message: "Invalid authorization format or value"
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                        ...corsHeaders
                    }
                }
            );
        }
    }
    return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
    matcher: [
        "/api/:path*",
        "/reset-password/:path*",
        "/registration/:path*",
        "/forgot-password/:path*",
        "/dashboard/:path*" // Add other protected paths here
    ]
};