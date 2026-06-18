import { NextResponse } from 'next/server';

// Test endpoint for rate-limit verification. Header reflection removed to prevent
// inadvertent disclosure of internal proxy headers or auth tokens to callers.
export async function GET(_request: Request) {
    return NextResponse.json({
        message: 'Rate limit test endpoint',
        timestamp: new Date().toISOString()
    });
}
