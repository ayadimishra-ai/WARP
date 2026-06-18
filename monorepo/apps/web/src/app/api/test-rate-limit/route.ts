import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const headers = request.headers;
    const allHeaders = Object.fromEntries(headers.entries());

    return NextResponse.json({
        message: 'Rate limit test endpoint',
        headers: allHeaders,
        timestamp: new Date().toISOString()
    });
}
