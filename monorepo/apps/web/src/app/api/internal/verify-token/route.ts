import { getServerEnv } from "@/lib/env/env.server";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { INTERNAL_AUTH_TOKEN } from "@/constants/auth.constants";
import crypto from "crypto";

/**
 * Internal API route for token verification
 * This runs in Node.js runtime and can access AWS Secrets Manager
 *
 * Protected by a shared internal token (stored in auth.constants.ts, sourced
 * from env at build time) to prevent external access.
 */
export async function POST(request: NextRequest) {
    try {
        // Verify internal authentication using constant-time comparison
        const internalAuth = request.headers.get("x-internal-auth") ?? "";
        const expected = INTERNAL_AUTH_TOKEN;

        const internalAuthBuf = Buffer.from(internalAuth.padEnd(expected.length));
        const expectedBuf = Buffer.from(expected);
        const isAuthorized =
            internalAuthBuf.length === expectedBuf.length &&
            crypto.timingSafeEqual(internalAuthBuf, expectedBuf);

        if (!isAuthorized) {
            return NextResponse.json(
                {
                    isValid: false,
                    error: "Unauthorized internal request"
                },
                { status: 401 }
            );
        }

        // Get the token to verify from request body
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                {
                    isValid: false,
                    error: "Token is required"
                },
                { status: 400 }
            );
        }

        // Fetch JWT_SECRET from AWS Secrets Manager
        const env = await getServerEnv();

        if (!env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const secret = new TextEncoder().encode(env.JWT_SECRET);

        // Verify the JWT token — issuer/audience match the Better-Auth JWT plugin config
        const { payload } = await jose.jwtVerify(token, secret, {
            issuer: env.NEXT_PUBLIC_API_BASE_URL,
            audience: env.NEXT_PUBLIC_API_BASE_URL
        });

        return NextResponse.json({
            isValid: true,
            payload
        });

    } catch (error) {
        const err = error as Error;
        return NextResponse.json({
            isValid: false,
            error: err.message || "Invalid token"
        });
    }
}

// Ensure this route runs in Node.js runtime (not Edge)
export const runtime = "nodejs";
