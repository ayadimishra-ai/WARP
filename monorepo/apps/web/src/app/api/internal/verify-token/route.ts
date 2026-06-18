import { getServerEnv } from "@/lib/env/env.server";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { INTERNAL_AUTH_TOKEN } from "@/constants/auth.constants";

/**
 * Internal API route for token verification
 * This runs in Node.js runtime and can access AWS Secrets Manager
 * 
 * Protected by hardcoded authentication token to prevent external access
 */
export async function POST(request: NextRequest) {
    try {
        // Verify internal authentication
        const internalAuth = request.headers.get("x-internal-auth");

        if (internalAuth !== INTERNAL_AUTH_TOKEN) {
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

        // Verify the JWT token
        const { payload } = await jose.jwtVerify(token, secret, {
            issuer: "DemoIssuer",
            audience: "DemoAudience"
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
